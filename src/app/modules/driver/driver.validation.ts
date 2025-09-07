import z from "zod";
import { IS_AVAILABLE } from "./driver.interface";

export const updateDriverOnlineStatus = z.object({
    isAvailable: z.enum(Object.values(IS_AVAILABLE)),
});
