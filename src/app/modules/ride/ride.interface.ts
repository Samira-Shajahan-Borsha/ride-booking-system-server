import { Types } from "mongoose";
import { ROLE } from "../user/user.interface";

export enum STATUS {
    REQUESTED = "REQUESTED",
    ACCEPTED = "ACCEPTED",
    PICKED_UP = "PICKED_UP",
    IN_TRANSIT = "IN_TRANSIT",
    COMPLETED = "COMPLETED",
    CANCELED = "CANCELED",
}

export enum PAYMENT_METHOD {
    CASH = "CASH",
    CARD = "CARD",
}

export interface IPickUp {
    address: string;
    type?: "Point";
    coordinates?: [number, number];
}

export interface IDestination {
    address: string;
    type?: "Point";
    coordinates?: [number, number];
}

export interface IRide {
    rider: Types.ObjectId;
    driver?: Types.ObjectId;
    vehicle?: Types.ObjectId;
    currentRiderId?: Types.ObjectId | null;
    status: STATUS;
    pickUp: IPickUp;
    destination: IDestination;
    fare?: number;
    distance?: number;
    paymentMethod: PAYMENT_METHOD;
    requestedAt: Date;
    acceptedAt?: Date;
    pickedUpAt?: Date;
    completedAt?: Date;
    canceledBy?: ROLE;
    rating?: number;
}
