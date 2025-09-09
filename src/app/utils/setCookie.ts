import { Response } from "express";
import { envVars } from "../config/env";

interface IAuthTokens {
    accessToken?: string;
    refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: IAuthTokens) => {
    res.cookie("accessToken", tokenInfo.accessToken, {
        httpOnly: true,
        secure: envVars.NODE_ENV === "production",
        sameSite: "none",
    });

    res.cookie("refreshToken", tokenInfo.refreshToken, {
        httpOnly: true,
        secure: envVars.NODE_ENV === "production",
        sameSite: "none",
    });
};
