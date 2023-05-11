import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { verifyRefreshToken } from "../middleware/auth";

// Create a new User
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, propic } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) throw new Error("User already exists.");

    const user = await User.create({ name, email, password, propic });

    user.set({ password: undefined });

    const authToken = user.genAuthToken();
    const refreshToken = user.genRefreshToken();

    return res.status(201).json({
      message: "User created successfully.",
      user,
      refreshToken,
      authToken,
    });
  } catch (error) {
    next(error);
  }
};

// Login a User
export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await User.schema.methods.findByCredentials(email, password);
    if (!user) throw new Error("User does not exists.");

    user.set({ password: undefined });

    const authToken = user.genAuthToken();
    const refreshToken = user.genRefreshToken();

    return res.status(200).json({
      message: "User signed in successfully.",
      user,
      refreshToken,
      authToken,
    });
  } catch (error) {
    next(error);
  }
};

export const sendTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    return res.status(200).json({
      message: "Tokens sent successfully.",
      user,
      refreshToken,
      authToken,
    });
  } catch (error) {
    next(error);
  }
};

export const sendUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req;
    if (!user) throw new Error("User not found.");

    user.set({ password: undefined });

    return res.status(200).json({
      message: "User profile retrieved successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req;
    if (!user) throw new Error("User not found.");

    await user.deleteOne();

    return res.status(200).json({ message: "User deleted." });
  } catch (error) {
    next(error);
  }
};
