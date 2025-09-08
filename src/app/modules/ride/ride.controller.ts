import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { RideService } from "./ride.service";

const requestRide = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user;
    const result = await RideService.requestRide(req.body, decodedToken.userId);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Ride request created successfully",
        data: result,
    });
});

const getAllRide = catchAsync(async (req: Request, res: Response) => {});
const getMyRides = catchAsync(async (req: Request, res: Response) => {});
const getMyRide = catchAsync(async (req: Request, res: Response) => {});
const getSingleRide = catchAsync(async (req: Request, res: Response) => {});
const updateRideStatus = catchAsync(async (req: Request, res: Response) => {});
const cancelRide = catchAsync(async (req: Request, res: Response) => {});

export const RideController = {
    requestRide,
    getAllRide,
    getMyRides,
    getMyRide,
    getSingleRide,
    updateRideStatus,
    cancelRide,
};
