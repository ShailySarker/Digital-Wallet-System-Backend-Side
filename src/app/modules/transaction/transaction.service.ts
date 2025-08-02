import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { Transaction } from "./transaction.model";
import { Wallet } from "../wallet/wallet.model";


const getAllTransactions = async () => {

    const transactions = await Transaction.find();
    if (!transactions) {
        throw new AppError(status.NOT_FOUND, "Transactions are not found");
    }

    return transactions;
};

const getMyTransactionsHistory = async (userId: string) => {

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        throw new AppError(status.NOT_FOUND, "No transaction are found");
    }

    const transactions = await Transaction.find({
        $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }],
    })
        .sort({ createdAt: -1 })
        .populate('initiatedBy', 'phone role');

    return transactions;
};

const getAgentCommissionHistory = async (agentId: string) => {

    const transactions = await Transaction.find({
        initiatedBy: agentId,
        commission: { $gt: 0 }
    })
        .sort({ createdAt: -1 });

    if (!transactions) {
        throw new AppError(status.NOT_FOUND, "Transactions are not found");
    }

    return transactions;
};

const getSingleTransaction = async (transactionId: string) => {

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
        throw new AppError(status.NOT_FOUND, "Transaction is not found");
    }

    return transaction;
};


export const TransactionServices = {
    getAllTransactions,
    getMyTransactionsHistory,
    getAgentCommissionHistory,
    getSingleTransaction
}