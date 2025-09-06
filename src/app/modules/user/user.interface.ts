import { Types } from "mongoose";

export enum ROLE {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    DRIVER = "DRIVER",
    RIDER = "RIDER",
}

export enum IS_ACTIVE {
    ACTIVE = "ACTIVE",
    BLOCKED = "BLOCKED",
}

export interface IAuthProvider {
    provider: "credentials" | "google";
    providerId: string;
}

export interface IUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: ROLE;
    isVerified: boolean;
    isDeleted: boolean;
    isActive: IS_ACTIVE;
    auths: IAuthProvider[];
}
