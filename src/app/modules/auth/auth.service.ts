import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { createTokens } from "../../utils/usertokens";
import { IS_ACTIVE, IUser, ROLE } from "../user/user.interface";
import { User } from "../user/user.model";
import { generateToken, verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { Driver } from "../driver/driver.model";
import { JwtPayload } from "jsonwebtoken";

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password: plainPassword } = payload;

    const isUserExist = await User.findOne({ email });

    if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist");
    }

    const isPasswordMatch = await bcrypt.compare(plainPassword as string, isUserExist.password as string);

    if (!isPasswordMatch) {
        throw new AppError(httpStatus.BAD_REQUEST, "Incorrect password");
    }

    const tokens = createTokens(isUserExist);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = isUserExist.toObject();

    return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: rest,
    };
};

const getAccessToken = async (refreshToken: string) => {
    const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_TOKEN_SECRET);

    const isUserExist = await User.findOne({ email: verifiedRefreshToken.email });

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
    }

    if (
        (isUserExist.role === ROLE.RIDER || isUserExist.role === ROLE.DRIVER) &&
        isUserExist.isActive === IS_ACTIVE.BLOCKED
    ) {
        throw new AppError(httpStatus.BAD_REQUEST, "User account is blocked");
    }

    // Todo handle driver role approval status
    /* if (isUserExist.role === ROLE.DRIVER) {
        
        throw new AppError(httpStatus.BAD_REQUEST, `User account is blocked or has been removed`);
    } */

    if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User account is deleted. Please contact with support");
    }

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role,
    };

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_TOKEN_SECRET, envVars.JWT_ACCESS_TOKEN_EXPIRES);

    return {
        accessToken,
    };
};

export const AuthServices = {
    credentialsLogin,
    getAccessToken,
};
