import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import httpStatus from "http-status-codes";
import { User } from "../modules/user/user.model";
import { IS_ACTIVE, ROLE } from "../modules/user/user.interface";
import { Driver } from "../modules/driver/driver.model";
import { APPROVAL_STATUS } from "../modules/driver/driver.interface";

export const checkAuth =
    (...authRole: string[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
        const accessToken = req.headers.authorization || req.cookies.accessToken;

        if (!accessToken) {
            throw new AppError(httpStatus.UNAUTHORIZED, "No token received");
        }

        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_TOKEN_SECRET);

        const isUserExist = await User.findById(verifiedToken.userId);

        // console.log(isUserExist, "User from middleware");

        if (!isUserExist) {
            throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
        }

        // After login, if the user account is blocked or the driver approval status is PENDING Or SUSPEND, the token will be sent from backend.
        // Frontend will handle it by redirecting it to a dedicated page "/account-status".

        /* if (
            (isUserExist.role === ROLE.RIDER || isUserExist.role === ROLE.DRIVER) &&
            isUserExist.isActive === IS_ACTIVE.BLOCKED
        ) {
            throw new AppError(httpStatus.BAD_REQUEST, "Your account is blocked");
        } */

        /* if (isUserExist.role === ROLE.DRIVER) {
            const driver = await Driver.findOne({ user: isUserExist._id });

            if (!driver) {
                throw new AppError(httpStatus.NOT_FOUND, "Driver does not exist");
            }

            if (driver.approvalStatus === APPROVAL_STATUS.SUSPEND) {
                throw new AppError(
                    httpStatus.BAD_REQUEST,
                    `You account is ${APPROVAL_STATUS.SUSPEND}. Please contact with support team`
                );
            }
        } */

        if (isUserExist.isDeleted) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "User account is deleted. Please contact with support"
            );
        }

        // console.log(verifiedToken);

        if (!authRole.includes(verifiedToken.role)) {
            throw new AppError(
                httpStatus.UNAUTHORIZED,
                "You are not permitted to access this route"
            );
        }

        req.user = verifiedToken;

        next();
    };
