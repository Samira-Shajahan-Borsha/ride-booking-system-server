import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { IRide, STATUS } from "./ride.interface";
import httpStatus from "http-status-codes";
import { Ride } from "./ride.model";
import { BASE_FARE, PER_KM_RATE } from "./ride.constant";
import { Driver } from "../driver/driver.model";
import { APPROVAL_STATUS } from "../driver/driver.interface";
import { ROLE } from "../user/user.interface";
import { JwtPayload } from "jsonwebtoken";

const requestRide = async (payload: IRide, riderId: string) => {
    const { rider, distance, ...rest } = payload;
    const existingRider = await User.findById(riderId);

    if (!existingRider) {
        throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist");
    }

    if (!existingRider._id.equals(rider)) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot request a ride for another user");
    }

    const currentUserAlreadyInRide = await Ride.findOne({
        currentRiderId: existingRider._id,
        status: { $in: [STATUS.REQUESTED, STATUS.ACCEPTED, STATUS.PICKED_UP, STATUS.IN_TRANSIT] },
    });

    if (currentUserAlreadyInRide) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "A ride is already assigned to this user. Complete or cancel it before requesting a new one."
        );
    }

    const distanceInKm = (distance as number) / 1000;

    const fare = BASE_FARE + distanceInKm * PER_KM_RATE;

    const ride = await Ride.create({
        rider,
        distance,
        fare,
        currentRiderId: existingRider._id,
        ...rest,
    });

    return ride;
};

const acceptRide = async (rideId: string, payload: IRide, userId: string) => {
    const existingRide = await Ride.findById(rideId);

    if (!existingRide) {
        throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
    }

    if (
        existingRide.status === STATUS.COMPLETED ||
        existingRide.status === STATUS.IN_TRANSIT ||
        existingRide.status === STATUS.PICKED_UP ||
        existingRide.status === STATUS.ACCEPTED ||
        existingRide.status === STATUS.CANCELED
    ) {
        throw new AppError(httpStatus.BAD_REQUEST, "This ride cannot be accepted");
    }

    const currentUser = await User.findById(userId);

    if (!currentUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const isDriverExist = await Driver.findOne({ user: currentUser._id });

    if (!isDriverExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    if (!isDriverExist._id.equals(payload.driver)) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to accept this ride.");
    }

    if (
        isDriverExist.approvalStatus === APPROVAL_STATUS.PENDING ||
        isDriverExist.approvalStatus === APPROVAL_STATUS.SUSPEND
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "You cannot accept this ride. You driving account has not been approved."
        );
    }

    if (isDriverExist.currentRide !== null) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "You are already assigned to another ride. Complete or cancel it before accepting a new one."
        );
    }

    const session = await Ride.startSession();

    session.startTransaction();

    try {
        const updatedRide = await Ride.findByIdAndUpdate(
            rideId,
            {
                driver: isDriverExist._id,
                acceptedAt: new Date(),
                status: STATUS.ACCEPTED,
            },
            { new: true, runValidators: true, session }
        );

        await Driver.findByIdAndUpdate(
            isDriverExist._id,
            { currentRide: existingRide._id },
            { new: true, runValidators: true, session }
        );

        await session.commitTransaction();

        session.endSession();

        return updatedRide;
    } catch (error) {
        console.log("Error occurs while accepting ride", error);
        await session.abortTransaction();
        session.endSession();
    }
};

const updateRideStatus = async (rideId: string, userId: string, payload: Partial<IRide>) => {
    const existingRide = await Ride.findById(rideId);

    if (!existingRide) {
        throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
    }

    if (existingRide.status === STATUS.COMPLETED || existingRide.status === STATUS.CANCELED) {
        throw new AppError(httpStatus.BAD_REQUEST, "This ride status can not be updated");
    }

    const currentUser = await User.findById(userId);

    if (!currentUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const isDriverExist = await Driver.findOne({ user: currentUser._id });

    if (!isDriverExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    if (!existingRide.driver?.equals(isDriverExist._id)) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to update the status of this ride.");
    }

    if (
        isDriverExist.approvalStatus === APPROVAL_STATUS.PENDING ||
        isDriverExist.approvalStatus === APPROVAL_STATUS.SUSPEND
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "You cannot update this ride. You driving account has not been approved."
        );
    }

    if (payload.status === existingRide.status) {
        throw new AppError(httpStatus.BAD_REQUEST, `Ride status has already been updated to ${existingRide.status}`);
    }

    const rideUpdateStatusPayload =
        payload.status === STATUS.PICKED_UP
            ? {
                  status: STATUS.PICKED_UP,
                  pickedUpAt: new Date(),
              }
            : { status: payload.status };

    const updatedRide = await Ride.findByIdAndUpdate(
        rideId,
        { $set: rideUpdateStatusPayload },
        { new: true, runValidators: true }
    ).select("-destination -pickUp");

    return updatedRide;
};

const completeRide = async (rideId: string, userId: string) => {
    const existingRide = await Ride.findById(rideId);

    if (!existingRide) {
        throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
    }

    if (existingRide.status === STATUS.COMPLETED || existingRide.status === STATUS.CANCELED) {
        throw new AppError(httpStatus.BAD_REQUEST, `This ride has already been ${existingRide.status.toLowerCase()}`);
    }

    const currentUser = await User.findById(userId);

    if (!currentUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const isDriverExist = await Driver.findOne({ user: currentUser._id });

    if (!isDriverExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    if (!existingRide.driver?.equals(isDriverExist._id)) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to complete this ride.");
    }

    if (
        isDriverExist.approvalStatus === APPROVAL_STATUS.PENDING ||
        isDriverExist.approvalStatus === APPROVAL_STATUS.SUSPEND
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "You cannot update this ride. You driving account has not been approved."
        );
    }

    const updatedRide = await Ride.findByIdAndUpdate(
        rideId,
        { status: STATUS.COMPLETED, completedAt: new Date() },
        { new: true, runValidators: true }
    ).select("-destination -pickUp");

    const earning = isDriverExist.totalEarnings + (updatedRide?.fare as number);

    await Driver.findByIdAndUpdate(
        isDriverExist._id,
        {
            currentRide: null,
            totalEarnings: earning,
        },
        { new: true, runValidators: true }
    );

    return updatedRide;
};

const cancelRide = async (rideId: string, userId: string) => {
    const existingRide = await Ride.findById(rideId);

    if (!existingRide) {
        throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
    }

    if (
        existingRide.status === STATUS.COMPLETED ||
        existingRide.status === STATUS.IN_TRANSIT ||
        existingRide.status === STATUS.PICKED_UP ||
        existingRide.status === STATUS.CANCELED
    ) {
        throw new AppError(httpStatus.BAD_REQUEST, "This ride cannot be canceled");
    }

    const currentUser = await User.findById(userId);

    if (!currentUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (currentUser.role === ROLE.RIDER) {
        if (!existingRide.rider.equals(currentUser._id)) {
            throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to cancel this ride.");
        }
    }

    if (currentUser.role === ROLE.DRIVER) {
        const isDriverExist = await Driver.findOne({ user: currentUser._id });
        if (!isDriverExist) {
            throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
        }

        if (!existingRide.driver?.equals(isDriverExist._id)) {
            throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to cancel this ride.");
        }

        await Driver.findByIdAndUpdate(existingRide.driver, { currentRide: null });
    }

    const updatedRide = await Ride.findByIdAndUpdate(
        rideId,
        { canceledBy: currentUser.role, status: STATUS.CANCELED, currentRiderId: null },
        { new: true, runValidators: true }
    );

    return updatedRide;
};

const getMyRides = async (decodedToken: JwtPayload) => {
    const existingUser = await User.findById(decodedToken.userId);

    if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (existingUser.role === ROLE.DRIVER) {
        const driver = await Driver.findOne({ user: existingUser._id });
        const rides = await Ride.find({ driver: driver?._id, status: STATUS.COMPLETED });
        return rides;
    }

    const rides = await Ride.find({ rider: existingUser?._id });

    return rides;
};

export const RideService = {
    requestRide,
    acceptRide,
    updateRideStatus,
    completeRide,
    cancelRide,
    getMyRides,
};
