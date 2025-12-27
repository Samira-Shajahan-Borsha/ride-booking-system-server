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

const getCurrentRide = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user;

    const result = await RideService.getCurrentRide(decodedToken.userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Current ride retrieved successfully",
        data: result,
    });
});

const getIncomingRideRequests = catchAsync(async (req: Request, res: Response) => {
    const result = await RideService.getIncomingRideRequests();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Available rides retrieved successfully",
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

export const getAllRides = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const decodedToken = req.user;

    const result = await RideService.getAllRides(query, decodedToken);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Ride history retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getSingleRide = catchAsync(async (req: Request, res: Response) => {
    const rideId = req.params.id;
    const decodedToken = req.user;

    const result = await RideService.getSingleRide(decodedToken, rideId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Ride details retrieved successfully",
        data: result,
    });
});

export const RideController = {
    requestRide,
    getCurrentRide,
    getIncomingRideRequests,
    acceptRide,
    updateRideStatus,
    completeRide,
    cancelRide,
    getSingleRide,
    getAllRides,
};
