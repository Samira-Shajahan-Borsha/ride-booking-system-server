import express, { Application, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import { notFound } from "./app/middlewares/notFound";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
    res.send({
        success: true,
        message: "Welcome to Ride Booking System",
    });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
