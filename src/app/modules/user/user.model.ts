import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";

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
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    phone: { type: String },
    role: {
      type: String,
      enum: {
        values: Object.values(Role),
        message: "{VALUE} is not supported as role",
      },
    },
    auths: [authProviderSchema],
    isVerified: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: {
        values: Object.values(IsActive),
        message: "{VALUE} is not supported",
      },
      default: IsActive.ACTIVE,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export const User = model<IUser>("User", userSchema);
