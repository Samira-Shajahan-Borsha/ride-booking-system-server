import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { Role } from "./user.interface";
import { creatUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.post("/register", validateRequest(creatUserZodSchema), UserController.createUser);
router.get("/get-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.getAllUsers);

export const UserRoutes = router;
