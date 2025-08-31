/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Response, Request } from "express";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatusCode from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserService.createUser(req.body);

  sendResponse(res, {
    statusCode: httpStatusCode.CREATED,
    success: true,
    message: "User created successfully",
    data: user,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await UserService.getAllUsers();

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "All users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
};
