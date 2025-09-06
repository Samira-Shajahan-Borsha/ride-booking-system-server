/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, ROLE } from "./user.interface";
import { User } from "./user.model";
import { Driver } from "../driver/driver.model";
import { APPROVAL_STATUS } from "../driver/driver.interface";

const createUser = async (payload: Partial<IUser>) => {
    const session = await User.startSession();
    session.startTransaction();

    try {
        const { email, password: plainPassword, role, ...rest } = payload;

        const isUserExist = await User.findOne({ email });

        if (isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(plainPassword as string, Number(envVars.BCRYPT_SALT_ROUND));

        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: email as string,
        };

        const createdUser = await User.create(
            [
                {
                    email,
                    role,
                    password: hashedPassword,
                    auths: [authProvider],
                    ...rest,
                },
            ],
            { session }
        );

        if (role === ROLE.DRIVER) {
            await Driver.create(
                [
                    {
                        userId: createdUser[0]._id,
                        approvalStatus: APPROVAL_STATUS.PENDING,
                        totalEarnings: 0,
                    },
                ],
                { session }
            );
        }

        const { password, ...user } = createdUser[0].toObject();

        await session.commitTransaction();
        session.endSession();

        return user;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(httpStatus.BAD_REQUEST, "Error occurs while creating user");
    }
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
