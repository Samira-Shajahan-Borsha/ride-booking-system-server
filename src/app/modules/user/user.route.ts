import { Router } from "express";
import { UserController } from "./user.controller";
import { creatUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router();

router.post("/register", validateRequest(creatUserZodSchema), UserController.createUser);
router.get("/get-users", UserController.getAllUsers);

export const UserRoutes = router;
