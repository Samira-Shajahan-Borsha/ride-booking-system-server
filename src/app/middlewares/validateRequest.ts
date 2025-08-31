import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateRequest = (zodSchema: ZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await zodSchema.parseAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};