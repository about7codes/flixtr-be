import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";

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
