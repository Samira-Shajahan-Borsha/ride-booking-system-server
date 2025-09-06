/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
    const { email, password: plainPassword, ...rest } = payload;

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(plainPassword as string, Number(envVars.BCRYPT_SALT_ROUND));

    const authProvider: IAuthProvider = {
        provider: "credentials",
        providerId: email as string,
    };

    const createdUser = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest,
    });

    const { password, ...user } = createdUser.toObject();

    return user;
};

const getAllUsers = async () => {
    const allUsers = await User.find({});

    const users = allUsers?.map((user) => {
        const { password, ...usersWithoutPassword } = user.toObject();
        return usersWithoutPassword;
    });

    const totalUsers = await User.countDocuments();

    return {
        data: users,
        meta: {
            total: totalUsers,
        },
    };
};

export const UserService = {
    createUser,
    getAllUsers,
};
