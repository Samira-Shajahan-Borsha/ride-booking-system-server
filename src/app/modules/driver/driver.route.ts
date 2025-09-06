import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";
import { DriverController } from "./driver.controller";

const router = Router();

router.get("/all-drivers", checkAuth(ROLE.SUPER_ADMIN, ROLE.ADMIN), DriverController.getAllDrivers);
router.get("/me", checkAuth(ROLE.DRIVER), DriverController.getMyProfile);

router.get("/:id", checkAuth(ROLE.SUPER_ADMIN, ROLE.ADMIN), DriverController.getSingleDriver);

export const DriverRoutes = router;
