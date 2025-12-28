import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { DriverRoutes } from "../modules/driver/driver.route";
import { RideRoutes } from "../modules/ride/ride.route";
import { StatsRoutes } from "../modules/stats/stats.route";
import { ContactRoutes } from "../modules/contact/contact.route";

const router = Router();

const moduleRoutes = [
    {
        path: "/users",
        route: UserRoutes,
    },
    {
        path: "/auth",
        route: AuthRoutes,
    },
    {
        path: "/drivers",
        route: DriverRoutes,
    },
    {
        path: "/rides",
        route: RideRoutes,
    },
    {
        path: "/stats",
        route: StatsRoutes,
    },
    {
        path: "/contacts",
        route: ContactRoutes,
    },
];

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
