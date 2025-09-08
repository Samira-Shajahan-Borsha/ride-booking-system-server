import z from "zod";
import { STATUS } from "./ride.interface";

export const requestRideZodSchema = z.object({
    rider: z.string(),
    pickUp: z.object({
        address: z.string(),
    }),
    destination: z.object({
        address: z.string(),
    }),
    distance: z.number(),
});

export const acceptRideZodSchema = z.object({
    driver: z.string(),
});

export const updateRideStatusZodSchema = z.object({
    status: z.enum([STATUS.PICKED_UP, STATUS.IN_TRANSIT]),
});
