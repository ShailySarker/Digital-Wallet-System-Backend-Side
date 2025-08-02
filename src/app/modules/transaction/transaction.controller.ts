import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TransactionServices } from "./transaction.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {

   const result = await TransactionServices.getAllTransactions();
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "All transactions retrieved successfully",
        data: result,
    });
});

const getMyTransactions = catchAsync(async (req: Request, res: Response) => {

    const user = req.body;
    const result = await TransactionServices.getMyTransactions(user?._id);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "My transactions retrieved successfully",
        data: result,
    });
});

const getAgentCommissionHistory = catchAsync(async (req: Request, res: Response) => {

    const agentId = req.user?._id;
    const result = await TransactionServices.getAgentCommissionHistory(agentId);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Wallet retrieved successfully",
        data: result,
    });
});

const getSingleTransaction = catchAsync(async (req: Request, res: Response) => {

    const transactionId = req.params.id;
    const result = await TransactionServices.getSingleTransaction(transactionId);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Transactions retrieved successfully",
        data: result,
    });
});


export const TransactionControllers = {
    getAllTransactions,
    getMyTransactions,
    getAgentCommissionHistory,
    getSingleTransaction
}