import { model, Schema } from "mongoose";
import { IAuthProvider, IS_ACTIVE, IUser, ROLE } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
    {
        provider: { type: String, required: true },
        providerId: { type: String, required: true },
    },
    {
        timestamps: false,
        versionKey: false,
        _id: false,
    }
);

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: [true, "Name is required"], trim: true },
        email: { type: String, required: [true, "Email is required"], trim: true },
        password: { type: String, minlength: [8, "Password must contain 8 characters long"], trim: true },
        phone: { type: String, trim: true },
        role: {
            type: String,
            enum: {
                values: Object.values(ROLE),
                message: "{VALUE} is not supported as role",
            },
            required: [true, "Role is required"],
        },
        isVerified: { type: Boolean, default: false },
        isActive: {
            type: String,
            enum: {
                values: Object.values(IS_ACTIVE),
                message: "{VALUE} is not supported as active status",
            },
            default: IS_ACTIVE.ACTIVE,
        },
        isDeleted: { type: Boolean, default: false },
        auths: [authProviderSchema],
    },
    { timestamps: true, versionKey: false }
);

export const User = model<IUser>("User", userSchema);
