import { IErrorSources, IGenericErrorResponse } from "../types/error.type";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleValidationError = (err: any, errorSources: IErrorSources[]): IGenericErrorResponse => {
    const errors = Object.values(err.errors);
    errors.forEach((errorObject: any) =>
        errorSources.push({
            path: errorObject.path,
            message: errorObject.message,
        })
    );

    return {
        statusCode: 400,
        message: "Validation Error",
        errorSources,
    };
};
