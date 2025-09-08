import { Response } from "express";

interface TMeta {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
}

interface IResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    meta?: TMeta;
    data: T;
}

export const sendResponse = <T>(res: Response, data: IResponse<T>) => {
    res.status(data.statusCode).json({
        statusCode: data.statusCode,
        success: data.success,
        message: data.message,
        meta: data.meta,
        data: data.data,
    });
};
