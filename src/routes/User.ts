import express, { NextFunction, Request, Response } from "express";
import { Schema, Validator } from "../middleware/Validator";
import { authenticate } from "../middleware/auth";
import {
  deleteAccount,
  sendTokens,
  sendUserProfile,
  signin,
  signup,
} from "../controllers/User";
import User from "../models/User";
import jwt from "jsonwebtoken";
import { config } from "../config";

const router = express.Router();

router.post("/signin", Validator(Schema.User.signin), signin);
router.post("/signup", Validator(Schema.User.signup), signup);

router.post(
  "/profile",
  authenticate,
  Validator(Schema.User.profile),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, propic } = req.body;
      const { user } = req;

      user?.set({ name, email, propic });
      await user?.save();

      return res.status(200).json({ message: "Profile updated successfully." });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/me", authenticate, sendUserProfile);
router.delete("/me", authenticate, deleteAccount);

router.get("/tokens", sendTokens);

router.get("/commento-token", authenticate, (req: Request, res: Response) => {
  if (!req.user) throw new Error("User not authenticated");

  const token = req.user.genCommentoToken();

  res
    .cookie("commentoToken", token, {
      domain: config.server.domain, // Top-level domain for all subdomains
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds,
    })
    .json({ success: true });
});

export default router;
