import { model, Schema } from "mongoose";
import { APPROVAL_STATUS, IDriver, IS_AVAILABLE } from "./driver.interface";

/* const locationSchema = new Schema<ILocation>(
    {
        address: {
            type: String,
        },
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: Number,
        },
    },
    { versionKey: false, timestamps: true, _id: false }
); */

const driverSchema = new Schema<IDriver>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        totalEarnings: {
            type: Number,
            trim: true,
            default: 0,
        },
        isAvailable: {
            type: String,
            enum: {
                values: Object.values(IS_AVAILABLE),
                message: "{VALUE} is not supported as available status",
            },
            default: IS_AVAILABLE.OFFLINE,
        },
        approvalStatus: {
            type: String,
            enum: {
                values: Object.values(APPROVAL_STATUS),
                message: "{VALUE} is not supported as approval status",
            },
            default: APPROVAL_STATUS.PENDING,
        },
        currentRide: {
            type: Schema.Types.ObjectId,
            ref: "Ride",
            default: null,
        },
        // location: locationSchema,
        vehicle: {
            type: String,
            trim: true,
            minLength: 2,
            default: null,
        },
        rating: {
            type: Number,
            default: null,
        },
    },
    { versionKey: false, timestamps: true }
);

export const Driver = model<IDriver>("Driver", driverSchema);
