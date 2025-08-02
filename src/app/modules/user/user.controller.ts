/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.createUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: "User created successfully",
        data: result.user,
    });
});

const getMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const decodedToken = req.user as JwtPayload;
    const result = await UserServices.getMyProfile(decodedToken.userId);
    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: "Your profile Retrieved Successfully",
        data: result.data
    })
});

const getAllCategoryUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await UserServices.getAllCategoryUser(query as Record<string, string>)

    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "All users retrieved successfully",
        data: result.data,
        meta: result.meta
    });
});

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllUsers();

    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "All users info retrieved successfully",
        data: result.users
    });
});

const getAllAgents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllAgents();

    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "All agents info retrieved successfully",
        data: result.users
    });
});

const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id);
    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: "User Retrieved Successfully",
        data: result.data
    });
});

const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const userId = req.params.id;
    const verifiedToken = req.user;
    const payload = req.body;

    const user = await UserServices.updateUser(userId, payload, verifiedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "User updated successfully",
        data: user,
    })
});

export const UserControllers = {
    createUser,
    getMyProfile,
    getAllCategoryUser,
    getAllUsers,
    getAllAgents,
    getSingleUser,
    updateUser
};