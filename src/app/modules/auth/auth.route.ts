import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";

const router = Router();

router.post("/login", AuthController.credentialsLogin);
router.post("/refresh-token", AuthController.getAccessToken);
router.post("/logout", AuthController.logout);

router.post("/change-password", checkAuth(...Object.values(ROLE)), AuthController.changePassword);

export const AuthRoutes = router;
