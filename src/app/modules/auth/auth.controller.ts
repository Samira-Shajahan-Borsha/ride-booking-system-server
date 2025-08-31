import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatusCode from "http-status-codes";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const loginInfo = await AuthServices.credentialsLogin(req.body);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "User logged in sccuessfully",
    data: loginInfo,
  });
});

export const AuthController = {
  credentialsLogin,
};
