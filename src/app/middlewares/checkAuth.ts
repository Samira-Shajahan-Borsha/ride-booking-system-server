import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { envVars } from "../config/env";
import jwt, { JwtPayload } from "jsonwebtoken";

export const checkAuth =
  (...authRole: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
      throw new AppError(401, "No token received");
    }

    const verifiedToken = jwt.verify(accessToken, envVars.JWT_ACCESS_TOKEN_SECRET) as JwtPayload;

    // console.log(verifiedToken);

    if (!authRole.includes(verifiedToken.role)) {
      throw new AppError(401, "You are not permitted to access this route");
    }

    next();
  };
