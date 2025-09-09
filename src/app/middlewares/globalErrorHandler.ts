/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { handleZodError } from "../errorHelpers/handleZodError";
import { IErrorSources } from "../types/error.type";
import { handleCastError } from "../errorHelpers/handleCastError";
import { handleValidationError } from "../errorHelpers/handleValidationError";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = "Something went wrong";
    let errorSources: IErrorSources[] = [];

    if (envVars.NODE_ENV === "development") {
        console.error("Error from global", err.message);
    }

    if (err.name === "ValidationError") {
        const simplifiedError = handleValidationError(err, errorSources);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources as IErrorSources[];
    }
    if (err.name === "CastError") {
        const simplifiedError = handleCastError();
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    } else if (err.name === "ZodError") {
        const simplifiedZodError = handleZodError(err, errorSources);
        statusCode = simplifiedZodError.statusCode;
        message = simplifiedZodError.message;
        errorSources = simplifiedZodError.errorSources as IErrorSources[];
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;

        message = err.message;
    } else if (err instanceof Error) {
        statusCode = 500;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: envVars.NODE_ENV === "development" ? err : null,
        stack: envVars.NODE_ENV === "development" ? err.stack : null,
    });
};
