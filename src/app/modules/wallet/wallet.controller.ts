import { Request, Response } from "express";
import status from "http-status";
import { WalletServices } from "./wallet.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";


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

    const user = req.user as JwtPayload;
    const result = await WalletServices.getMyWallet(user.userId);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Your wallet retrieved successfully",
        data: result
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

const walletBlockingOrUnblocking = catchAsync(async (req: Request, res: Response) => {
    const walletId = req.params.id;
    const body = req.body;
    const result = await WalletServices.walletBlockingOrUnblocking(walletId, body);
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
        message: "Money withdrew successfully",
        data: result,
    });
});

const sendMoney = catchAsync(async (req: Request, res: Response) => {
    const senderId = req.user?.userId;
    const { recipientId, amount} = req.body;
    const result = await WalletServices.sendMoney(senderId, recipientId, amount);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Money sent successfully",
        data: result,
    });
});

// agent give -> user take
const cashIn = catchAsync(async (req: Request, res: Response) => {
    const agentId = req.user?.userId;
    const { userId, amount } = req.body;

    const result = await WalletServices.cashIn(agentId, userId, amount);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Cash in successful",
        data: result,
    });
});

// user give -> agent take
const cashOut = catchAsync(async (req: Request, res: Response) => {
    const agentId = req.user?.userId;
    const { userId, amount } = req.body;

    const result = await WalletServices.cashOut(userId, agentId, amount);
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
    walletBlockingOrUnblocking,
    depositMoney,
    withdrawMoney,
    sendMoney,
    cashIn,
    cashOut
}