import { model, Schema } from "mongoose";
import { APPROVAL_STATUS, IDriver, IS_AVAILABLE } from "./driver.interface";

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
            default: IS_AVAILABLE.ONLINE,
        },
        approvalStatus: {
            type: String,
            enum: {
                values: Object.values(APPROVAL_STATUS),
                message: "{VALUE} is not supported as approval status",
            },
            default: APPROVAL_STATUS.PENDING,
        },
        vehicleInfo: {
            type: String,
            trim: true,
        },
        rating: {
            type: Number,
        },
    },
    { versionKey: false, timestamps: true }
);

export const Driver = model<IDriver>("Driver", driverSchema);
