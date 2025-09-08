import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { DriverService } from "./driver.service";
import { JwtPayload } from "jsonwebtoken";

const getAllDrivers = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await DriverService.getAllDrivers(query as Record<string, string>);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All drivers retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user as JwtPayload;

    const result = await DriverService.getMyProfile(decodedToken.userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your driving profile retrieved successfully",
        data: result,
    });
});

const getMyEarning = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user as JwtPayload;

    const result = await DriverService.getMyEarning(decodedToken.userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your earning retrieved successfully",
        data: result,
    });
});

const approveDriver = catchAsync(async (req: Request, res: Response) => {
    const driverId = req.params.id;

    const result = await DriverService.approveDriver(driverId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Driver approved successfully",
        data: result,
    });
});

const suspendDriver = catchAsync(async (req: Request, res: Response) => {
    const driverId = req.params.id;

    const result = await DriverService.suspendDriver(driverId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Driver suspended successfully",
        data: result,
    });
});

const updateAvailableStatus = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user;
    const driverId = req.params.id;

    const result = await DriverService.updateAvailableStatus(decodedToken.userId, driverId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Driver online status updated successfully",
        data: result,
    });
});

const getSingleDriver = catchAsync(async (req: Request, res: Response) => {
    const driverId = req.params.id;
    const result = await DriverService.getSingleDriver(driverId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Driver retrieved successfully",
        data: result,
    });
});

export const DriverController = {
    getAllDrivers,
    getMyProfile,
    getMyEarning,
    approveDriver,
    suspendDriver,
    updateAvailableStatus,
    getSingleDriver,
};
