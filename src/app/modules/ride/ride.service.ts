import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { IRide, STATUS } from "./ride.interface";
import httpStatus from "http-status-codes";
import { Ride } from "./ride.model";
import { BASE_FARE, PER_KM_RATE } from "./ride.constant";

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

export const RideService = {
    requestRide,
};
