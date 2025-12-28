import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { ContactService } from "./contact.service";

const submitMessage = catchAsync(async (req: Request, res: Response) => {
    const result = await ContactService.submitMessage(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Message submitted successfully",
        data: result,
    });
});

export const ContactController = {
    submitMessage,
};
