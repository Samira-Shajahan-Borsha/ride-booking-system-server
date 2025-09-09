import { IGenericErrorResponse } from "../types/error.type";

export const handleCastError = (): IGenericErrorResponse => {
    const statusCode = 400;
    const message = "Invalid MongoDB ObjectId. Please provide a valid id.";

    return {
        statusCode,
        message,
    };
};
