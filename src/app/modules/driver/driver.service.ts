import AppError from "../../errorHelpers/AppError";
import { Driver } from "./driver.model";
import httpStatus from "http-status-codes";

const getAllDrivers = async () => {
    const drivers = await Driver.find({});

    const totalDrivers = await Driver.countDocuments();

    return {
        data: drivers,
        meta: {
            total: totalDrivers,
        },
    };
};

const getMyProfile = async (userId: string) => {
    const isDriverExist = await Driver.findOne({ user: userId }).populate("user", "-password");

    if (!isDriverExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    return isDriverExist;
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
    getSingleDriver,
};
