/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IS_ACTIVE, IUser, ROLE } from "./user.interface";
import { User } from "./user.model";
import { Driver } from "../driver/driver.model";
import { APPROVAL_STATUS } from "../driver/driver.interface";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";

const createUser = async (payload: Partial<IUser>) => {
    const session = await User.startSession();
    session.startTransaction();

    try {
        const { email, password: plainPassword, role, ...rest } = payload;

        const isUserExist = await User.findOne({ email });

        if (isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(
            plainPassword as string,
            Number(envVars.BCRYPT_SALT_ROUND)
        );

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
                        user: createdUser[0]._id,
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

const getAllUsers = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(User.find(), query);

    const users = queryBuilder.search(userSearchableFields).filter().sort().fields().paginate();

    const [data, meta] = await Promise.all([users.build(), queryBuilder.getMeta()]);

    const userData = data?.map((user) => {
        const { password, ...usersWithoutPassword } = user.toObject();
        return usersWithoutPassword;
    });

    return {
        data: userData,
        meta: meta,
    };
};

const getAllRiders = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(User.find({ role: ROLE.RIDER }), query);

    const users = queryBuilder.search(userSearchableFields).filter().sort().fields().paginate();

    const [data, meta] = await Promise.all([users.build(), queryBuilder.getMeta()]);

    const userData = data?.map((user) => {
        const { password, ...usersWithoutPassword } = user.toObject();
        return usersWithoutPassword;
    });

    return {
        data: userData,
        meta: meta,
    };
};

const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist");
    }

    return user;
};

const blockRider = async (userId: string) => {
    const existingUser = await User.findById(userId);

    if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (existingUser.role === ROLE.DRIVER) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Driver accounts cannot be blocked. Use Suspend or Approve options instead."
        );
    }

    if (existingUser.isActive === IS_ACTIVE.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Rider account is already blocked");
    }

    const updatedRider = await User.findByIdAndUpdate(
        existingUser._id,
        {
            isActive: IS_ACTIVE.BLOCKED,
        },
        { new: true, runValidators: true }
    ).select("-password");

    return updatedRider;
};

const unblockRider = async (userId: string) => {
    const existingUser = await User.findById(userId);

    if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (existingUser.role === ROLE.DRIVER) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Driver accounts are always active. Use Suspend or Approve options to manage driver access."
        );
    }

    if (existingUser.isActive === IS_ACTIVE.ACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, "Rider account is already active");
    }

    const updatedRider = await User.findByIdAndUpdate(
        existingUser._id,
        {
            isActive: IS_ACTIVE.ACTIVE,
        },
        { new: true, runValidators: true }
    ).select("-password");

    return updatedRider;
};

const getUser = async (userId: string) => {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist");
    }

    return user;
};

const updateUser = async (userId: string, decodedToken: JwtPayload, payload: Partial<IUser>) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist");
    }

    if (decodedToken.role === ROLE.DRIVER || decodedToken.role === ROLE.RIDER) {
        if (payload.role || payload.isActive || payload.isDeleted) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "Drivers and riders are not authorized to update user status or roles"
            );
        }
    }

    if (decodedToken.role === ROLE.DRIVER || decodedToken.role === ROLE.RIDER) {
        if (String(user._id) !== decodedToken.userId) {
            throw new AppError(
                httpStatus.UNAUTHORIZED,
                "You are not authorized to update other user"
            );
        }
    }

    if (user.role === ROLE.SUPER_ADMIN && decodedToken.role === ROLE.ADMIN) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "Admins are not authorized to assign or update the Super Admin role"
        );
    }

    const updatedUser = await User.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    }).select("-password");

    return updatedUser;
};

export const UserService = {
    createUser,
    getAllUsers,
    getAllRiders,
    getMe,
    blockRider,
    unblockRider,
    getUser,
    updateUser,
};
