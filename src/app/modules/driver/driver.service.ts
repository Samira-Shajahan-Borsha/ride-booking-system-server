import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { APPROVAL_STATUS, IDriver } from "./driver.interface";
import { Driver } from "./driver.model";
import httpStatus from "http-status-codes";

const getAllDrivers = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Driver.find(), query);

    const drivers = await queryBuilder.filter().sort().fields().paginate();

    const [data, meta] = await Promise.all([drivers.build().populate("user", "name email"), queryBuilder.getMeta()]);

    return {
        data,
        meta,
    };
};

const getMyProfile = async (userId: string) => {
    const isDriverExist = await Driver.findOne({ user: userId }).populate("user", "-password");

    if (!isDriverExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    return isDriverExist;
};

const getMyEarning = async (userId: string) => {
    const existingDriver = await Driver.findOne({ user: userId }).select("totalEarnings");

    if (!existingDriver) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    return existingDriver;
};

const approveDriver = async (driverId: string) => {
    const existingDriver = await Driver.findById(driverId);

    if (!existingDriver) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    if (existingDriver.approvalStatus === APPROVAL_STATUS.APPROVED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Driver has already been approved");
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
        existingDriver._id,
        {
            approvalStatus: APPROVAL_STATUS.APPROVED,
        },
        { new: true, runValidators: true }
    ).populate("user", "name email isActive");

    return updatedDriver;
};

const suspendDriver = async (driverId: string) => {
    const existingDriver = await Driver.findById(driverId);

    if (!existingDriver) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    if (existingDriver.approvalStatus === APPROVAL_STATUS.SUSPEND) {
        throw new AppError(httpStatus.BAD_REQUEST, "Driver has already been suspended");
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
        existingDriver._id,
        {
            approvalStatus: APPROVAL_STATUS.SUSPEND,
        },
        { new: true, runValidators: true }
    ).populate("user", "name email isActive");

    return updatedDriver;
};

const updateAvailableStatus = async (userId: string, driverId: string, payload: IDriver) => {
    const existingDriver = await Driver.findById(driverId);

    if (!existingDriver) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    if (userId !== String(existingDriver.user)) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to access other driver profile");
    }

    if (
        existingDriver.approvalStatus === APPROVAL_STATUS.PENDING ||
        existingDriver.approvalStatus === APPROVAL_STATUS.SUSPEND
    ) {
        throw new AppError(httpStatus.FORBIDDEN, "Your profile is not accessible until it has been approved");
    }

    if (existingDriver.isAvailable === payload.isAvailable) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Driver availability status is already set to ${payload.isAvailable.toLowerCase()}`
        );
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
        existingDriver._id,
        {
            isAvailable: payload.isAvailable,
        },
        { new: true, runValidators: true }
    ).populate("user", "name email isActive");

    return updatedDriver;
};

const getSingleDriver = async (driverId: string) => {
    const isDriverExist = await Driver.findById(driverId).populate("user", "-password");

    if (!isDriverExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    return isDriverExist;
};

export const DriverService = {
    getAllDrivers,
    getMyProfile,
    getMyEarning,
    approveDriver,
    suspendDriver,
    updateAvailableStatus,
    getSingleDriver,
};
