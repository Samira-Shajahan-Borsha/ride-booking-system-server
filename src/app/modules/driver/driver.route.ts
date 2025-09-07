import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";
import { DriverController } from "./driver.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { updateDriverOnlineStatus } from "./driver.validation";

const router = Router();

router.get("/all-drivers", checkAuth(ROLE.SUPER_ADMIN, ROLE.ADMIN), DriverController.getAllDrivers);
router.get("/me", checkAuth(ROLE.DRIVER), DriverController.getMyProfile);
router.patch("/approve/:id", checkAuth(ROLE.ADMIN, ROLE.SUPER_ADMIN), DriverController.approveDriver);
router.patch("/suspend/:id", checkAuth(ROLE.ADMIN, ROLE.SUPER_ADMIN), DriverController.suspendDriver);
router.post(
    "/available-status/:id",
    validateRequest(updateDriverOnlineStatus),
    checkAuth(ROLE.DRIVER),
    DriverController.updateAvailableStatus
);
router.get("/:id", checkAuth(ROLE.SUPER_ADMIN, ROLE.ADMIN), DriverController.getSingleDriver);

export const DriverRoutes = router;
