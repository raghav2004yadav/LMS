require("dotenv").config();
import { Response } from "express";
import { IUser } from "../modals/user_model";
import { redis } from "./redis";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

//parse enviromnet variables to integrates with fallback value

const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "30",
  10
);
const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "120",
  10
);

 //OPTIONS FOR COOKIES

export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire + 3600000),
  maxAge: accessTokenExpire + 3600000,
  httpOnly: true,
  sameSite: "lax",
};

//refresh token options

export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire + 3600000),
  maxAge: refreshTokenExpire + 3600000,
  httpOnly: true,
  sameSite: "lax",
};


export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  //upload session to redis


  redis.set(user._id,JSON.stringify(user)as any);

  

 
  //only set secure to tru in production

  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
  }

  res.cookie("access_token", accessToken, accessTokenOptions);

  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
