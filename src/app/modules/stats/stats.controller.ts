import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatsService } from "./stats.service";
import { JwtPayload } from "jsonwebtoken";

const getUserStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getUserStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User stats fetched successfully",
        data: stats,
    });
});

const getDriverStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getDriverStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Driver stats fetched successfully",
        data: stats,
    });
});

const getRideStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getRideStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Ride stats fetched successfully",
        data: stats,
    });
});

const getDriverEarningsStats = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user as JwtPayload;

    const stats = await StatsService.getDriverEarningsStats(decodedToken.userId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Driver earning stats fetched successfully",
        data: stats,
    });
});

export const StatsController = {
    getUserStats,
    getDriverStats,
    getRideStats,
    getDriverEarningsStats,
};
