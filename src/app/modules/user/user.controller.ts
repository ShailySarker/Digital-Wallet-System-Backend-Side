/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: "User created successfully",
        data: user,
    })
});
const getMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: "User created successfully",
        data: user,
    })
});
const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: "User created successfully",
        data: user,
    })
});
const getAllAgents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: "User created successfully",
        data: user,
    })
});
const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: "User created successfully",
        data: user,
    })
});
const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: "User created successfully",
        data: user,
    })
});


export const UserControllers = {
    createUser,
    getMyProfile,
    getAllUsers,
    getAllAgents,
    getSingleUser,
    updateUser
};