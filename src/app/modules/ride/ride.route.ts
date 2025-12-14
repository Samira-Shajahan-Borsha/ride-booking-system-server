import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";
import { RideController } from "./ride.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { acceptRideZodSchema, requestRideZodSchema, updateRideStatusZodSchema } from "./ride.validation";

const router = Router();

router.post("/request", validateRequest(requestRideZodSchema), checkAuth(ROLE.RIDER), RideController.requestRide);
router.get("/current-ride", checkAuth(ROLE.RIDER, ROLE.DRIVER), RideController.getCurrentRide);
router.get("/incoming-ride-requests", checkAuth(ROLE.DRIVER), RideController.getIncomingRideRequests);
router.get("/all-rides", checkAuth(ROLE.SUPER_ADMIN, ROLE.ADMIN), RideController.getAllRide);
router.get("/me", checkAuth(ROLE.RIDER, ROLE.DRIVER), RideController.getMyRides);
router.patch("/accept/:id", validateRequest(acceptRideZodSchema), checkAuth(ROLE.DRIVER), RideController.acceptRide);
router.patch(
    "/status/:id",
    validateRequest(updateRideStatusZodSchema),
    checkAuth(ROLE.DRIVER),
    RideController.updateRideStatus
);
router.patch("/complete/:id", checkAuth(ROLE.DRIVER), RideController.completeRide);
router.patch("/cancel/:id", checkAuth(ROLE.RIDER, ROLE.DRIVER), RideController.cancelRide);
router.get("/:id", checkAuth(ROLE.SUPER_ADMIN, ROLE.ADMIN), RideController.getSingleRide);

export const RideRoutes = router;
