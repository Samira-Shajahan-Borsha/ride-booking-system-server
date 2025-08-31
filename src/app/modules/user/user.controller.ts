import { NextFunction, Response, Request } from "express";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatusCode from "http-status-codes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserService.createUser(req.body);

    sendResponse(res, {
      statusCode: httpStatusCode.CREATED,
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UserService.getAllUsers();

    sendResponse(res, {
      statusCode: httpStatusCode.OK,
      success: true,
      message: "All users retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.log(error);
  }
};

export const UserController = {
  createUser,
  getAllUsers,
};
