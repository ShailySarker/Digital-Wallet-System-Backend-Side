import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { Transaction } from "./transaction.model";
import { Wallet } from "../wallet/wallet.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { myTransactionsSearchableFields } from "./transaction.constant";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { QueryOptions } from "./transaction.interface";

const getAllTransactions = async (query: Record<string, string>) => {
  // Build the base filter for database-level filtering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbFilter: any = {};

  // Apply filters that can be handled at the database level
  if (query.type) dbFilter.type = query.type;
  if (query.status) dbFilter.status = query.status;

  // Handle search term at database level
  if (query.searchTerm) {
    dbFilter.$or = [
      { type: { $regex: query.searchTerm, $options: "i" } },
      { status: { $regex: query.searchTerm, $options: "i" } },
    ];
  }

  // Build sort option
  const sortParam = query.sort || "-createdAt";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortOption: any = {};

  switch (sortParam) {
    case "amount":
      sortOption.amount = 1;
      break;
    case "-amount":
      sortOption.amount = -1;
      break;
    case "commission":
      sortOption.commission = 1;
      break;
    case "-commission":
      sortOption.commission = -1;
      break;
    case "createdAt":
      sortOption.createdAt = 1;
      break;
    case "-createdAt":
    default:
      sortOption.createdAt = -1;
      break;
  }

  // Pagination
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // First, get ALL transactions that match the database-level filters
  const allTransactions = await Transaction.find(dbFilter)
    .sort(sortOption)
    .populate([
      {
        path: "fromWallet",
        populate: { path: "user", select: "name phone role" },
      },
      {
        path: "toWallet",
        populate: { path: "user", select: "name phone role" },
      },
      { path: "initiatedBy", select: "phone role" },
    ]);

  // Then transform the data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedData = allTransactions.map((transaction: any) => {
    const transformed = transaction.toObject();

    // Extract and flatten fromWallet data
    if (transaction.fromWallet && typeof transaction.fromWallet === "object") {
      transformed.fromWallet = transaction.fromWallet._id;
      if (transaction.fromWallet.user) {
        transformed.fromWalletSender = transaction.fromWallet.user.name;
        transformed.fromWalletPhone = transaction.fromWallet.user.phone;
        transformed.fromWalletRole = transaction.fromWallet.user.role;
      }
      delete transformed.fromWallet;
    }

    // Extract and flatten toWallet data
    if (transaction.toWallet && typeof transaction.toWallet === "object") {
      transformed.toWallet = transaction.toWallet._id;
      if (transaction.toWallet.user) {
        transformed.toWalletReceiver = transaction.toWallet.user.name;
        transformed.toWalletPhone = transaction.toWallet.user.phone;
        transformed.toWalletRole = transaction.toWallet.user.role;
      }
      delete transformed.toWallet;
    }

    // Extract initiatedBy data if needed
    if (
      transaction.initiatedBy &&
      typeof transaction.initiatedBy === "object"
    ) {
      transformed.initiatedBy = transaction.initiatedBy._id;
      transformed.initiatedByPhone = transaction.initiatedBy.phone;
      transformed.initiatedByRole = transaction.initiatedBy.role;
    }

    return transformed;
  });

  // Apply additional filtering on the FULL transformed dataset
  let filteredData = transformedData;

  if (query.fromWalletSender) {
    filteredData = filteredData.filter(
      (item) =>
        item.fromWalletSender &&
        item.fromWalletSender.includes(query.fromWalletSender as string)
    );
  }

  if (query.fromWalletPhone) {
    filteredData = filteredData.filter(
      (item) =>
        item.fromWalletPhone &&
        item.fromWalletPhone.includes(query.fromWalletPhone as string)
    );
  }

  if (query.toWalletReceiver) {
    filteredData = filteredData.filter(
      (item) =>
        item.toWalletReceiver &&
        item.toWalletReceiver.includes(query.toWalletReceiver as string)
    );
  }

  if (query.toWalletPhone) {
    filteredData = filteredData.filter(
      (item) =>
        item.toWalletPhone &&
        item.toWalletPhone.includes(query.toWalletPhone as string)
    );
  }

  if (query.fromWalletRole) {
    filteredData = filteredData.filter(
      (item) =>
        item.fromWalletRole &&
        item.fromWalletRole.includes(query.fromWalletRole as string)
    );
  }

  if (query.toWalletRole) {
    filteredData = filteredData.filter(
      (item) =>
        item.toWalletRole &&
        item.toWalletRole.includes(query.toWalletRole as string)
    );
  }

  // Apply pagination AFTER all filtering is done
  const total = filteredData.length;
  const totalPage = Math.ceil(total / limit);
  const startIndex = skip;
  const endIndex = Math.min(startIndex + limit, total);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    meta: { page, limit, total, totalPage },
  };
};
// ========================================================================
// const getMyTransactionsHistory = async (userId: string) => {
//   const wallet = await Wallet.findOne({ user: userId });
//   // console.log(wallet);
//   if (!wallet) {
//     throw new AppError(status.NOT_FOUND, "No wallet is found");
//   }

//   const myTransaction = Transaction.find({
//     $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }],
//   })
//     .sort({ createdAt: -1 })
//     .populate("initiatedBy", "phone role");

//   return myTransaction;
// };

// const getMyTransactionsHistory = async (
//   userId: string,
//   query: Record<string, string>
// ) => {
//   const wallet = await Wallet.findOne({ user: userId });
//   // console.log(wallet);
//   if (!wallet) {
//     throw new AppError(status.NOT_FOUND, "No wallet is found");
//   }
//   const myTransaction = Transaction.find({
//     $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }],
//   })
//   .sort({ createdAt: -1 })
//   .populate([
//     { path: "fromWallet", populate: { path: "user", select: "name phone role" } },
//     { path: "toWallet", populate: { path: "user", select: "name phone role" } },
//     { path: "initiatedBy", select: "phone role" },
//   ]);
// console.log(myTransaction);
// const queryBuilder = new QueryBuilder(myTransaction, query);
// const myTransactionData = queryBuilder
//   .filter()
//   .search(myTransactionsSearchableFields)
//   .sort()
//   .fields()
//   .paginate();
// const [data, meta] = await Promise.all([
//   myTransactionData.build(),
//   queryBuilder.getMeta(),
// ]);
// return {
//   data,
//   meta,
// };
// };

const getMyTransactionsHistory = async (
  userId: string,
  query: Record<string, string> = {}
) => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    throw new AppError(status.NOT_FOUND, "No wallet is found");
  }

  // Create the initial filter
  const initialFilter = {
    $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }],
  };

  // Create base query with initial filter
  const myTransaction = Transaction.find(initialFilter)
    .sort({ createdAt: -1 })
    .populate([
      {
        path: "fromWallet",
        populate: { path: "user", select: "name phone role" },
      },
      {
        path: "toWallet",
        populate: { path: "user", select: "name phone role" },
      },
      { path: "initiatedBy", select: "phone role" },
    ]);

  const queryBuilder = new QueryBuilder(myTransaction, query);
  const myTransactionData = queryBuilder
    .filter()
    .search(myTransactionsSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    myTransactionData.build(),
    queryBuilder.getMeta(),
  ]);

  // Transform the data to the desired format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedData = data.map((transaction: any) => {
    const transformed = transaction.toObject();

    // Extract and flatten fromWallet data
    if (transaction.fromWallet && typeof transaction.fromWallet === "object") {
      transformed.fromWallet = transaction.fromWallet._id;
      if (transaction.fromWallet.user) {
        transformed.fromWalletSender = transaction.fromWallet.user.name;
        transformed.fromWalletPhone = transaction.fromWallet.user.phone;
        transformed.fromWalletRole = transaction.fromWallet.user.role;
      }
      // Remove the nested object
      delete transformed.fromWallet;
    }

    // Extract and flatten toWallet data
    if (transaction.toWallet && typeof transaction.toWallet === "object") {
      transformed.toWallet = transaction.toWallet._id;
      if (transaction.toWallet.user) {
        transformed.toWalletReceiver = transaction.toWallet.user.name;
        transformed.toWalletPhone = transaction.toWallet.user.phone;
        transformed.toWalletRole = transaction.toWallet.user.role;
      }
      // Remove the nested object
      delete transformed.toWallet;
    }

    // Extract initiatedBy data if needed
    if (
      transaction.initiatedBy &&
      typeof transaction.initiatedBy === "object"
    ) {
      transformed.initiatedBy = transaction.initiatedBy._id;
      transformed.initiatedByPhone = transaction.initiatedBy.phone;
      transformed.initiatedByRole = transaction.initiatedBy.role;
    }

    return transformed;
  });

  return {
    data: transformedData,
    meta,
  };
};

const getAgentCommissionHistory = async (
  agentId: string,
  options: QueryOptions = {}
) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;

  // Allow sorting by createdAt, amount, or commission
  const sortBy = ["createdAt", "amount", "commission"].includes(
    options.sortBy as string
  )
    ? options.sortBy
    : "createdAt";

  const sortOrder = options.sortOrder === "asc" ? "asc" : "desc";

  const skip = (page - 1) * limit;

  // Build sort object dynamically
  const sortOptions: Record<string, 1 | -1> = {
    [sortBy as string]: sortOrder === "asc" ? 1 : -1,
  };

  // Add commission filter to only show transactions with commission
  const query = {
    initiatedBy: agentId,
    commission: { $gt: 0 },
  };

  const myCommissions = await Transaction.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate([
      {
        path: "fromWallet",
        populate: { path: "user", select: "name phone role" },
      },
      {
        path: "toWallet",
        populate: { path: "user", select: "name phone role" },
      },
      { path: "initiatedBy", select: "phone role" },
    ]);

  const total = await Transaction.countDocuments(query);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedData = myCommissions.map((transaction: any) => {
    const transformed = transaction.toObject();

    // Flatten fromWallet
    if (transaction.fromWallet && typeof transaction.fromWallet === "object") {
      transformed.fromWalletId = transaction.fromWallet._id;
      if (transaction.fromWallet.user) {
        transformed.fromWalletSender = transaction.fromWallet.user.name;
        transformed.fromWalletPhone = transaction.fromWallet.user.phone;
        transformed.fromWalletRole = transaction.fromWallet.user.role;
      }
    }

    // Flatten toWallet
    if (transaction.toWallet && typeof transaction.toWallet === "object") {
      transformed.toWalletId = transaction.toWallet._id;
      if (transaction.toWallet.user) {
        transformed.toWalletReceiver = transaction.toWallet.user.name;
        transformed.toWalletPhone = transaction.toWallet.user.phone;
        transformed.toWalletRole = transaction.toWallet.user.role;
      }
    }

    // Flatten initiatedBy
    if (
      transaction.initiatedBy &&
      typeof transaction.initiatedBy === "object"
    ) {
      transformed.initiatedById = transaction.initiatedBy._id;
      transformed.initiatedByPhone = transaction.initiatedBy.phone;
      transformed.initiatedByRole = transaction.initiatedBy.role;
    }

    return transformed;
  });

  return {
    data: transformedData,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

// const getAgentCommissionHistory = async (agentId: string) => {
//   const myCommissions = await Transaction.find({
//     initiatedBy: agentId,
//     commission: { $gt: 0 },
//   })
//     .sort({ createdAt: -1 })
//     .populate([
//       {
//         path: "fromWallet",
//         populate: { path: "user", select: "name phone role" },
//       },
//       {
//         path: "toWallet",
//         populate: { path: "user", select: "name phone role" },
//       },
//       { path: "initiatedBy", select: "phone role" },
//     ]);

//   if (!myCommissions) {
//     throw new AppError(status.NOT_FOUND, "Commissions are not available now");
//   }

//   const transformedData = myCommissions.map((transaction: any) => {
//     const transformed = transaction.toObject();

//     // Extract and flatten fromWallet data
//     if (transaction.fromWallet && typeof transaction.fromWallet === "object") {
//       transformed.fromWallet = transaction.fromWallet._id;
//       if (transaction.fromWallet.user) {
//         transformed.fromWalletSender = transaction.fromWallet.user.name;
//         transformed.fromWalletPhone = transaction.fromWallet.user.phone;
//         transformed.fromWalletRole = transaction.fromWallet.user.role;
//       }
//       // Remove the nested object
//       delete transformed.fromWallet;
//     }

//     // Extract and flatten toWallet data
//     if (transaction.toWallet && typeof transaction.toWallet === "object") {
//       transformed.toWallet = transaction.toWallet._id;
//       if (transaction.toWallet.user) {
//         transformed.toWalletReceiver = transaction.toWallet.user.name;
//         transformed.toWalletPhone = transaction.toWallet.user.phone;
//         transformed.toWalletRole = transaction.toWallet.user.role;
//       }
//       // Remove the nested object
//       delete transformed.toWallet;
//     }

//     // Extract initiatedBy data if needed
//     if (
//       transaction.initiatedBy &&
//       typeof transaction.initiatedBy === "object"
//     ) {
//       transformed.initiatedBy = transaction.initiatedBy._id;
//       transformed.initiatedByPhone = transaction.initiatedBy.phone;
//       transformed.initiatedByRole = transaction.initiatedBy.role;
//     }

//     return transformed;
//   });

//   return transformedData;
// };

const getSingleTransaction = async (transactionId: string) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    throw new AppError(status.NOT_FOUND, "Transaction is not found");
  }

  return transaction;
};

const getAgentStats = async (agent: JwtPayload) => {
  const receiverId = new mongoose.Types.ObjectId(String(agent.userId));
  const senderId = new mongoose.Types.ObjectId(String(agent.userId));
  const userBalance = await Wallet.findOne({ user: agent.userId });
  if (!userBalance) {
    throw new AppError(status.NOT_FOUND, "Wallet is not found");
  }
  const totalCashIn = await Transaction.aggregate([
    {
      $match: {
        $or: [
          { toWallet: receiverId },
          {
            fromWallet: senderId,
          },
        ],
        type: "cash-in",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);
  const totalCashOut = await Transaction.aggregate([
    {
      $match: {
        $or: [{ receiver: receiverId }, { sender: senderId }],
        type: "cash-out",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);
  const totalCommission = await Transaction.aggregate([
    {
      $match: {
        $or: [{ receiver: receiverId }, { sender: senderId }],
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$commission" },
      },
    },
  ]);
  const recentTransactions = await Transaction.find({
    $or: [{ receiver: receiverId }, { sender: senderId }],
  })
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    balance: userBalance.balance,
    totalCashIn: totalCashIn[0]?.total || 0,
    totalCashOut: totalCashOut[0]?.total || 0,
    totalCommission: totalCommission[0]?.total || 0,
    recentTransactions,
  };
};

export const TransactionServices = {
  getAllTransactions,
  getMyTransactionsHistory,
  getAgentCommissionHistory,
  getSingleTransaction,
  getAgentStats,
};
