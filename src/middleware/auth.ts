import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";
import User, { IUserModel } from "../models/User";
import { IWatchlistModel } from "../models/Watchlist";

declare module "express" {
  export interface Request {
    authToken?: string;
    user?: IUserModel;
    media?: IWatchlistModel;
  }
}

// route authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authToken = req.header("Authorization")?.split(" ")[1];
    if (!authToken) throw new Error("No token provided.");

    const decodedToken = <JwtPayload>(
      jwt.verify(authToken, config.server.jwtAuthSecret)
    );
    if (!decodedToken) throw new Error("Invalid token.");

    const user = await User.findById(decodedToken.id);
    if (!user) throw new Error("Please login again.");

    req.authToken = authToken;
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const verifyRefreshToken = (
  refreshToken: string
): Promise<JwtPayload> => {
  return new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(
      refreshToken,
      config.server.jwtRefreshSecret,
      (error, decoded) => {
        if (error) reject(error);
        resolve(decoded as JwtPayload);
      }
    );
  });
};
