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
import User, { IUserModel } from "../models/User";
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

router.get("/sso", authenticate, async (req: Request, res: Response) => {
  try {
    const { user } = req;
    if (!user) throw new Error("User not authenticated");

    // Prepare SSO payload (must match Remark42's expected format)
    const ssoPayload = {
      id: user._id.toString(), // Unique user ID
      name: user?.name || "KIKI", // Display name
      picture: getProfilePic(user), // Full URL to avatar
      email: user?.email || "KIKImail", // Optional but recommended
      admin: false, // Set true for moderators/admins
    };

    // Sign the token with your JWT secret (matches AUTH_SSO_SECRET)
    const token = jwt.sign(ssoPayload, config.server.jwtAuthSecret, {
      expiresIn: "5m", // Short-lived token for security
    });

    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: "SSO failed" });
  }
});

// Helper function to construct profile picture URL
function getProfilePic(user: IUserModel): string {
  return user.propic
    ? `https://devbe.flixbaba.com/avatars/${user.propic}.jpg`
    : "https://devbe.flixbaba.com/avatars/default.jpg";
}

export default router;
