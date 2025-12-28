import { Router } from "express";
import { ContactController } from "./contact.controller";

const router = Router();

router.post("/message", ContactController.submitMessage);

export const ContactRoutes = router;
