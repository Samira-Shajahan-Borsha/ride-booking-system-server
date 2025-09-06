import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "./user.interface";

const router = Router();

router.post("/register", validateRequest(createUserZodSchema), UserController.createUser);
router.get("/get-users", checkAuth(ROLE.ADMIN, ROLE.SUPER_ADMIN), UserController.getAllUsers);
router.get("/me", checkAuth(...Object.values(ROLE)), UserController.getMe);

router.get("/:id", checkAuth(ROLE.SUPER_ADMIN, ROLE.ADMIN), UserController.getUser);
router.patch(
    "/:id",
    validateRequest(updateUserZodSchema),
    checkAuth(...Object.values(ROLE)),
    UserController.updateUser
);

export const UserRoutes = router;
