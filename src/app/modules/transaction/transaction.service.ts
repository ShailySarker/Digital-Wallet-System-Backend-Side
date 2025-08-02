import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { Transaction } from "./transaction.model";
import { User } from "../user/user.model";


const getAllTransactions = async () => {

    const transactions = await Transaction.find();
    if (!transactions) {
        throw new AppError(status.NOT_FOUND, "Transactions are not found");
    }

    return transactions;
};

const getMyTransactions = async (userId: string) => {

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(status.NOT_FOUND, 'User is not found');
    }

    const Transactions = await Transaction.findOne({ user: userId });
    if (!Transactions) {
        throw new AppError(status.NOT_FOUND, "Transactions are not found");
    }

    return Transactions;
};

const getAgentCommissionHistory = async (agentId: string) => {

    const agent = await User.findById(agentId);
    if (!agent) {
        throw new AppError(status.NOT_FOUND, 'Agent is not found');
    }

    const transactions = await Transaction.find({
        initiatedBy: agentId,
        commission: { $gt: 0 }
    })
        .sort({ createdAt: -1 })
        .populate('fromWallet', 'user')
        .populate('toWallet', 'user');;

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
    getMyTransactions,
    getAgentCommissionHistory,
    getSingleTransaction
}