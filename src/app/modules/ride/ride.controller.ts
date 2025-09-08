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

const acceptRide = catchAsync(async (req: Request, res: Response) => {
    const rideId = req.params.id;
    const decodedToken = req.user;
    const result = await RideService.acceptRide(rideId, req.body, decodedToken.userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Ride accepted successfully",
        data: result,
    });
});

const updateRideStatus = catchAsync(async (req: Request, res: Response) => {
    const rideId = req.params.id;
    const decodedToken = req.user;

    const result = await RideService.updateRideStatus(rideId, decodedToken.userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Ride status updated successfully",
        data: result,
    });
});

const completeRide = catchAsync(async (req: Request, res: Response) => {
    const rideId = req.params.id;
    const decodedToken = req.user;

    const result = await RideService.completeRide(rideId, decodedToken.userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Ride completed successfully",
        data: result,
    });
});

const cancelRide = catchAsync(async (req: Request, res: Response) => {
    const rideId = req.params.id;
    const decodedToken = req.user;

    const result = await RideService.cancelRide(rideId, decodedToken.userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Ride canceled successfully",
        data: result,
    });
});

const getAllRide = catchAsync(async (req: Request, res: Response) => {});
const getMyRides = catchAsync(async (req: Request, res: Response) => {});
const getMyRide = catchAsync(async (req: Request, res: Response) => {});
const getSingleRide = catchAsync(async (req: Request, res: Response) => {});

export const RideController = {
    requestRide,
    acceptRide,
    updateRideStatus,
    completeRide,
    cancelRide,
    getAllRide,
    getMyRides,
    getMyRide,
    getSingleRide,
};
