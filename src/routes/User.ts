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

export default router;
