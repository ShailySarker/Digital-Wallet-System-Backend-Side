import { Response } from "express"

export interface AuthTokens {
    accessToken?: string;
    refreshToken?: string;
}
export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {

    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            // local
            // secure: false 
            // live link
            // secure: envVars.NODE_ENV === "production",
            // sameSite: "none"
            secure: true,
            sameSite: "none"

        });
    }

    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            // local
            // secure: false 
            // live link
            // secure: envVars.NODE_ENV === "production",
            // sameSite: "none"
            secure: true,
            sameSite: "none"
        });
    }

};