/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.createUser(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User created successfully",
        data: user,
    });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await UserService.getAllUsers(query as Record<string, string>);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All users retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user;
    const result = await UserService.getMe(decodedToken.userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your profile retrieved successfully",
        data: result,
    });
});

const getUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const result = await UserService.getUser(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User retrieved successfully",
        data: result,
    });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const decodedToken = req.user;

    const result = await UserService.updateUser(userId, decodedToken, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User updated successfully",
        data: result,
    });
});

export const UserController = {
    createUser,
    getAllUsers,
    getMe,
    getUser,
    updateUser,
};
