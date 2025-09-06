import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";

export const checkAuth =
    (...authRole: string[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
        const accessToken = req.headers.authorization;

        if (!accessToken) {
            throw new AppError(401, "No token received");
        }

        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_TOKEN_SECRET);

        // console.log(verifiedToken);

        if (!authRole.includes(verifiedToken.role)) {
            throw new AppError(401, "You are not permitted to access this route");
        }

        next();
    };
