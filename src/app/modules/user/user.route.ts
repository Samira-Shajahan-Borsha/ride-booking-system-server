import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { createUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "./user.interface";

const router = Router();

router.post("/register", validateRequest(createUserZodSchema), UserController.createUser);
router.get("/get-users", checkAuth(ROLE.ADMIN, ROLE.SUPER_ADMIN), UserController.getAllUsers);

export const UserRoutes = router;
