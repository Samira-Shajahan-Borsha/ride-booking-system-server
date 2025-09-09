import { IErrorSources, IGenericErrorResponse } from "../types/error.type";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleZodError = (err: any, errorSources: IErrorSources[]): IGenericErrorResponse => {
    err.issues.map((issue: any) =>
        errorSources.push({
            path: issue.path[issue.path.length - 1],
            message: issue.message,
        })
    );

    return {
        statusCode: 400,
        message: "ZodError",
        errorSources,
    };
};
