import { model, Schema } from "mongoose";
import { IPickUp, IRide, STATUS } from "./ride.interface";
import { ROLE } from "../user/user.interface";

const pickUpSchema = new Schema<IPickUp>(
    {
        address: {
            type: String,
            required: true,
        },
        /* type: {
            type: String,
            enum: ["Point"],
        },
        coordinates: {
            type: [Number],
        }, */
    },
    { timestamps: false, versionKey: false, _id: false }
);

const destinationSchema = new Schema<IPickUp>(
    {
        address: {
            type: String,
            required: true,
        },
        /* type: {
            type: String,
            enum: ["Point"],
        },
        coordinates: {
            type: [Number],
        }, */
    },
    { timestamps: false, versionKey: false, _id: false }
);

const rideSchema = new Schema<IRide>(
    {
        rider: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        driver: {
            type: Schema.Types.ObjectId,
            ref: "Driver",
            default: null,
        },
        vehicle: {
            type: Schema.Types.ObjectId,
            ref: "Vehicle",
            default: null,
        },
        currentRiderId: {
            type: Schema.Types.ObjectId || null,
            ref: "User",
            default: null,
        },
        status: {
            type: String,
            enum: {
                values: Object.values(STATUS),
                message: "{VALUE} is not supported as status",
            },
            required: true,
            default: STATUS.REQUESTED,
        },
        pickUp: pickUpSchema,
        destination: destinationSchema,
        fare: {
            type: Number,
            required: true,
        },
        distance: {
            type: Number,
            required: true,
            min: 0,
        },
        requestedAt: {
            type: Date,
            required: true,
            default: new Date(),
        },
        acceptedAt: {
            type: Date,
            default: null,
        },
        pickedUpAt: {
            type: Date,
            default: null,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        canceledBy: {
            type: String,
            enum: Object.values(ROLE),
            default: null,
        },
        rating: {
            type: Number,
            default: null,
        },
    },
    { versionKey: false, timestamps: true }
);

export const Ride = model<IRide>("Ride", rideSchema);
