import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";
import { StatsController } from "./stats.controller";

const router = express.Router();

router.get("/user", checkAuth(ROLE.ADMIN, ROLE.SUPER_ADMIN), StatsController.getUserStats);
router.get("/driver", checkAuth(ROLE.ADMIN, ROLE.SUPER_ADMIN), StatsController.getDriverStats);
router.get("/ride", checkAuth(ROLE.ADMIN, ROLE.SUPER_ADMIN), StatsController.getRideStats);
router.get("/driver/me", checkAuth(ROLE.DRIVER), StatsController.getDriverEarningsStats);

export const StatsRoutes = router;
