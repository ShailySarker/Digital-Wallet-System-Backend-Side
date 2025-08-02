import { Request, Response } from "express";
import status from "http-status";
import { WalletServices } from "./wallet.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";


const getSingleWallet = catchAsync(async (req: Request, res: Response) => {

    const walletId = req.params.id;
    const result = await WalletServices.getSingleWallet(walletId);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Wallet retrieved successfully",
        data: result,
    });
});

const getMyWallet = catchAsync(async (req: Request, res: Response) => {

    const user = req.body;
    const result = await WalletServices.getMyWallet(user?._id);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "My wallet retrieved successfully",
        data: result,
    });
});

const getAllWallets = catchAsync(async (req: Request, res: Response) => {

    const result = await WalletServices.getAllWallets();
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "All wallets retrieved successfully",
        data: result,
    });
});

const blockWallet = catchAsync(async (req: Request, res: Response) => {
    const walletId = req.params.id;
    const result = await WalletServices.blockWallet(walletId);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Wallet status updated successfully",
        data: result,
    });
});

const depositMoney = catchAsync(async (req: Request, res: Response) => {

    const userId = req.user?.userId;
    const { amount } = req.body;

    const result = await WalletServices.depositMoney(userId, amount);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Money deposited successfully",
        data: result,
    });
});

const withdrawMoney = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { amount } = req.body;

    const result = await WalletServices.withdrawMoney(userId, amount);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Money withdrawn successfully",
        data: result,
    });
});

const sendMoney = catchAsync(async (req: Request, res: Response) => {
    const senderId = req.user?.userId;
    const { recipientId, amount } = req.body;

    const result = await WalletServices.sendMoney(senderId, recipientId, amount);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Money sent successfully",
        data: result,
    });
});

const cashIn = catchAsync(async (req: Request, res: Response) => {
    const senderId = req.user?.userId;
    const { recipientId, amount } = req.body;

    const result = await WalletServices.cashIn(senderId, recipientId, amount);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Cash in successful",
        data: result,
    });
});

const cashOut = catchAsync(async (req: Request, res: Response) => {
    const agent = req.user?.userId;
    const { userId, amount } = req.body;

    const result = await WalletServices.cashOut(agent, userId, amount);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Cash out successful",
        data: result,
    });
});


export const WalletControllers = {
    getSingleWallet,
    getMyWallet,
    getAllWallets,
    blockWallet,
    depositMoney,
    withdrawMoney,
    sendMoney,
    cashIn,
    cashOut
}