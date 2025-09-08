import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";
import { RideController } from "./ride.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { acceptRideZodSchema, requestRideZodSchema } from "./ride.validation";

const router = Router();

router.post("/request", validateRequest(requestRideZodSchema), checkAuth(ROLE.RIDER), RideController.requestRide);
router.get("/all-ride", checkAuth(ROLE.SUPER_ADMIN, ROLE.ADMIN), RideController.getAllRide);
router.get("/me", checkAuth(...Object.values(ROLE)), RideController.getMyRides);
router.patch("/accept/:id", validateRequest(acceptRideZodSchema), checkAuth(ROLE.DRIVER), RideController.acceptRide);
router.get("/me/:id", checkAuth(...Object.values(ROLE)), RideController.getMyRide);
router.get("/:id", checkAuth(ROLE.SUPER_ADMIN, ROLE.ADMIN), RideController.getSingleRide);
router.patch("/status/:id", checkAuth(ROLE.RIDER, ROLE.DRIVER), RideController.updateRideStatus);
router.post("/cancel/:id", checkAuth(ROLE.RIDER, ROLE.DRIVER), RideController.cancelRide);

export const RideRoutes = router;
