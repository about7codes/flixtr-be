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

router.get(
  "/sso",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      if (!user) throw new Error("User not authenticated");

      // Prepare SSO payload (must match Commento's expected format)
      const ssoPayload = {
        email: user.email, // Required by Commento
        name: user.name, // Required by Commento
        link: "", // Optional
        avatar: user.propic, // Optional
        iss: "devbe.flixbaba.com", // Recommended
        aud: "commento", // Recommended
        sub: user._id.toString(), // Recommended
      };

      // Sign with the same secret used in Commento's docker-compose
      const token = jwt.sign(ssoPayload, config.server.jwtAuthSecret, {
        expiresIn: "30d", // Short-lived token for security
      });

      return res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
