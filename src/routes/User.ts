import express from "express";
import { Schema, Validator } from "../middleware/Validator";
import { authenticate } from "../middleware/auth";
import {
  deleteAccount,
  sendTokens,
  sendUserProfile,
  signin,
  signup,
} from "../controllers/User";

const router = express.Router();

router.post("/signin", Validator(Schema.User.signin), signin);
router.post("/signup", Validator(Schema.User.signup), signup);

router.get("/me", authenticate, sendUserProfile);
router.delete("/me", authenticate, deleteAccount);

router.get("/tokens", sendTokens);

export default router;
