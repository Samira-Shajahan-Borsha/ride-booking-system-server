import { Types } from "mongoose";

export enum IS_AVAILABLE {
    OFFLINE = "OFFLINE",
    ONLINE = "ONLINE",
}

export enum APPROVAL_STATUS {
    PENDING = "PENDING",
    SUSPEND = "SUSPEND",
    APPROVED = "APPROVED",
}

export interface ILocation {
    address: string;
    type?: "Point";
    coordinates?: [number, number];
}

export interface IDriver {
    user: Types.ObjectId;
    totalEarnings: number;
    // rides?: Types.ObjectId[];
    isAvailable: IS_AVAILABLE;
    approvalStatus: APPROVAL_STATUS;
    // location?: ILocation;
    currentRide?: Types.ObjectId | null;
    vehicle?: Types.ObjectId;
    rating?: number;
}
