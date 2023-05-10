import express, { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { Schema, Validator } from "../middleware/Validator";
import { verifyRefreshToken } from "../middleware/auth";

const router = express.Router();

router.get(
  "/tokens",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refToken = req.header("Authorization")?.split(" ")[1];
      if (!refToken) throw new Error("No refresh token prvided.");

      const decodedToken = await verifyRefreshToken(refToken);
      if (!decodedToken) throw new Error("Invalid token provided.");

      const user = await User.findById(decodedToken.id);
      if (!user) throw new Error("User does not exists.");
      user.set({ password: undefined });

      const authToken = user.genAuthToken();
      const refreshToken = user.genRefreshToken();

      res.status(200).json({
        message: "Tokens sent successfully.",
        user,
        refreshToken,
        authToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/signin",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = await User.schema.methods.findByCredentials(email, password);
      if (!user) throw new Error("User does not exists.");

      user.set({ password: undefined });

      const authToken = user.genAuthToken();
      const refreshToken = user.genRefreshToken();

      res.status(200).json({
        message: "User signed in successfully.",
        user,
        refreshToken,
        authToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/signup",
  Validator(Schema.User.signup),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, propic } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) throw new Error("User already exists.");

      const user = await User.create({ name, email, password, propic });

      user.set({ password: undefined });

      const authToken = user.genAuthToken();
      const refreshToken = user.genRefreshToken();

      res.status(201).json({
        message: "User created successfully.",
        user,
        refreshToken,
        authToken,
      });
    } catch (error) {
      // console.log(error);
      // res.status(400).json(error);
      next(error);
    }
  }
);

export default router;
