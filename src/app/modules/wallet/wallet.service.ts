/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { Wallet } from "./wallet.model";
import { IWallet, Wallet_Status } from "./wallet.interface";
import { Transaction } from "../transaction/transaction.model";
import {
  Transaction_Status,
  Transaction_Type,
} from "../transaction/transaction.interface";
import { envVars } from "../../config/env";
import mongoose from "mongoose";
import { User } from "../user/user.model";
import { Role } from "../user/user.interface";

const getMyWallet = async (userId: string) => {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    throw new AppError(status.NOT_FOUND, "Wallet is not found");
  }

  return wallet;
};

const getAllWallets = async () => {
  const wallets = await Wallet.find();
  if (!wallets) {
    throw new AppError(status.NOT_FOUND, "No wallets are available now");
  }

  return wallets;
};

const walletBlockingOrUnblocking = async (
  walletId: string,
  payload: Partial<IWallet>
) => {
  const wallet = await Wallet.findById(walletId);
  if (!wallet) {
    throw new AppError(status.NOT_FOUND, "Wallet is not found");
  }

  if (payload.status === wallet.status) {
    throw new AppError(status.NOT_FOUND, `Wallet is already ${wallet.status}`);
  }

  wallet.status = payload.status;
  await wallet.save();

  return wallet;
};

const depositMoney = async (userId: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await Wallet.findOne({ user: userId }).session(session);
    if (!wallet) {
      throw new AppError(status.NOT_FOUND, "Wallet is not found");
    }
    if (wallet.status === Wallet_Status.BLOCK) {
      throw new AppError(status.BAD_REQUEST, "Wallet is blocked");
    }
    if (!amount || amount <= 0) {
      throw new AppError(status.BAD_REQUEST, "Amount must be greater than 0");
    }
    if (amount < 200) {
      throw new AppError(status.BAD_REQUEST, "Miniumum deposit amount 200 TK");
    }

    wallet.balance += amount;
    await wallet.save({ session });

    await Transaction.create(
      [
        {
          fromWallet: wallet._id,
          toWallet: wallet._id,
          amount,
          fee: 0,
          type: Transaction_Type.DEPOSIT,
          status: Transaction_Status.SUCCESS,
          initiatedBy: userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return wallet;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const withdrawMoney = async (userId: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await Wallet.findOne({ user: userId }).session(session);
    if (!wallet) {
      throw new AppError(status.NOT_FOUND, "Wallet is not found");
    }
    if (wallet.status === Wallet_Status.BLOCK) {
      throw new AppError(status.BAD_REQUEST, "Wallet is blocked");
    }
    if (!amount || amount <= 0) {
      throw new AppError(status.BAD_REQUEST, "Amount must be greater than 0");
    }
    if (amount < 100) {
      throw new AppError(status.BAD_REQUEST, "Miniumum withdrow amount 100 TK");
    }
    if (amount > wallet.balance) {
      throw new AppError(status.BAD_REQUEST, "Wallet money is not sufficient");
    }

    // Update wallet balance
    wallet.balance -= amount;
    await wallet.save({ session });

    // Create transaction record
    await Transaction.create(
      [
        {
          fromWallet: wallet._id,
          toWallet: wallet._id,
          amount,
          fee: 0,
          type: Transaction_Type.WITHDRAW,
          status: Transaction_Status.SUCCESS,
          initiatedBy: userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return wallet;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const sendMoney = async (
  senderId: string,
  receiver_phone: string,
  amount: number
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!amount || amount <= 0) {
      throw new AppError(status.BAD_REQUEST, "Amount must be greater than 0");
    }

    const senderWallet = await Wallet.findOne({ user: senderId }).session(
      session
    );
    if (!senderWallet) {
      throw new AppError(status.NOT_FOUND, "Sender is not found");
    }
    if (senderWallet.status === Wallet_Status.BLOCK) {
      throw new AppError(status.FORBIDDEN, "Sender wallet is blocked");
    }
    if (!senderWallet || senderWallet.balance < amount) {
      throw new AppError(status.BAD_REQUEST, "Insufficient balance");
    }

    const receiver = await User.findOne({
      $or: [{ phone: receiver_phone }, { email: receiver_phone }],
    }).session(session);

    // const receiver = await User.findOne({ phone: receiver_phone || email: receiver_phon}).session(
    //   session
    // );
    if (!receiver) {
      throw new AppError(status.BAD_REQUEST, "User not found");
    }
    if (receiver.role === Role.ADMIN) {
      throw new AppError(
        status.BAD_REQUEST,
        "Receiver account is not user or agent"
      );
    }
    const recipientId = receiver._id;

    const recipientWallet = await Wallet.findOne({ user: recipientId }).session(
      session
    );
    if (!recipientWallet) {
      throw new AppError(status.NOT_FOUND, "Recipient is not found");
    }

    if (recipientWallet.status === Wallet_Status.BLOCK) {
      throw new AppError(status.FORBIDDEN, "Recipient wallet is blocked");
    }

    if (senderId === recipientId.toString()) {
      throw new AppError(status.BAD_REQUEST, "Cannot send money to yourself");
    }

    // Calculate fee
    const fee = amount * (Number(envVars.WALLET.TRANSACTION_FEE) / 100);
    const totalAmount = amount + fee;

    // Update sender balance
    senderWallet.balance -= totalAmount;
    await senderWallet.save({ session });

    // Update recipient balance
    recipientWallet.balance += amount;
    await recipientWallet.save({ session });

    // Create transaction record
    await Transaction.create(
      [
        {
          fromWallet: senderWallet._id,
          toWallet: recipientWallet._id,
          amount: amount,
          fee: fee,
          commission: 0,
          type: Transaction_Type.SEND,
          status: Transaction_Status.SUCCESS,
          initiatedBy: senderId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    // return {
    //     newBalance: senderWallet.balance,
    // };
    return {
      senderWallet: senderWallet,
      recipientWallet: recipientWallet,
    };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cashIn = async (agentId: string, user_phone: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!amount || amount <= 0) {
      throw new AppError(status.BAD_REQUEST, "Invalid amount");
    }
    const agentWallet = await Wallet.findOne({ user: agentId }).session(
      session
    );
    if (!agentWallet) {
      throw new AppError(status.NOT_FOUND, "Agent is not found");
    }
    if (agentWallet.status === Wallet_Status.BLOCK) {
      throw new AppError(status.FORBIDDEN, "Agent wallet is blocked");
    }
    if (!agentWallet || agentWallet.balance < amount) {
      throw new AppError(status.BAD_REQUEST, "Insufficient balance");
    }

    const user = await User.findOne({ phone: user_phone }).session(session);

    if (!user) {
      throw new AppError(status.BAD_REQUEST, "User not found");
    }
    if (user.role !== Role.USER) {
      throw new AppError(status.BAD_REQUEST, "Receiver account is not user");
    }
    const userId = user._id;
    const userWallet = await Wallet.findOne({ user: userId }).session(session);

    if (!userWallet) {
      throw new AppError(status.NOT_FOUND, "User is not found");
    }

    if (userWallet.status === Wallet_Status.BLOCK) {
      throw new AppError(status.FORBIDDEN, "User wallet is blocked");
    }

    if (agentId === userId.toString()) {
      throw new AppError(status.BAD_REQUEST, "Cannot cash-in to yourself");
    }

    // Update recipient balance
    agentWallet.balance -= amount;
    await agentWallet.save({ session });

    // Update user balance
    userWallet.balance += amount;
    await userWallet.save({ session });

    // Create transaction record
    await Transaction.create(
      [
        {
          fromWallet: agentWallet._id,
          toWallet: userWallet._id,
          amount,
          fee: 0,
          type: Transaction_Type.CASH_IN,
          status: Transaction_Status.SUCCESS,
          initiatedBy: agentId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    // return { newBalance: userWallet.balance };
    return {
      agentWallet: agentWallet,
      userWallet: userWallet,
    };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cashOut = async (user_phone: string, agentId: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!amount || amount <= 0) {
      throw new AppError(status.BAD_REQUEST, "Invalid amount");
    }
    const user = await User.findOne({ phone: user_phone }).session(session);

    if (!user) {
      throw new AppError(status.BAD_REQUEST, "User not found");
    }
    if (user.role !== Role.USER) {
      throw new AppError(status.BAD_REQUEST, "Receiver account is not user");
    }
    const userId = user._id;
    const userWallet = await Wallet.findOne({ user: userId }).session(session);
    if (!userWallet) {
      throw new AppError(status.NOT_FOUND, "User is not found");
    }

    if (userWallet.status === Wallet_Status.BLOCK) {
      throw new AppError(status.FORBIDDEN, "User wallet is blocked");
    }

    // if (!userWallet || userWallet.balance < amount) {
    //   throw new AppError(status.BAD_REQUEST, "Insufficient balance");
    // }

    const agentWallet = await Wallet.findOne({ user: agentId }).session(
      session
    );
    if (!agentWallet) {
      throw new AppError(status.NOT_FOUND, "Agent is not found");
    }
    if (agentWallet.status === Wallet_Status.BLOCK) {
      throw new AppError(status.FORBIDDEN, "Agent wallet is blocked");
    }
    if (!agentWallet || agentWallet.balance < amount) {
      throw new AppError(status.BAD_REQUEST, "Insufficient balance");
    }
    if (userId.toString() === agentId) {
      throw new AppError(status.BAD_REQUEST, "Cannot cash-out to yourself");
    }

    // Calculate commission
    const commission = amount * (Number(envVars.WALLET.COMMISSION_RATE) / 100);
    const totalAmount = amount + commission;

    // Update user balance
    userWallet.balance -= totalAmount;
    await userWallet.save({ session });

    // Update recipient balance
    agentWallet.balance += amount;
    await agentWallet.save({ session });

    // Create transaction record
    await Transaction.create(
      [
        {
          fromWallet: userWallet._id,
          toWallet: agentWallet._id,
          amount,
          fee: 0,
          commission,
          type: Transaction_Type.CASH_OUT,
          status: Transaction_Status.SUCCESS,
          initiatedBy: agentId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    // return {
    //     newBalance: userWallet.balance,
    // };

    return {
      agentWallet: agentWallet,
      userWallet: userWallet,
    };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getSingleWallet = async (walletId: string) => {
  const wallet = await Wallet.findById(walletId);
  if (!wallet) {
    throw new AppError(status.NOT_FOUND, "Wallet is not found");
  }

  return wallet;
};

export const WalletServices = {
  getSingleWallet,
  getMyWallet,
  getAllWallets,
  walletBlockingOrUnblocking,
  depositMoney,
  withdrawMoney,
  sendMoney,
  cashIn,
  cashOut,
};
