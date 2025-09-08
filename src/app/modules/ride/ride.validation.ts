import z from "zod";

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
