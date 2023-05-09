import express, { NextFunction, Request, Response } from "express";
import User from "../models/User";

const router = express.Router();

router.get("/signin", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hi from login" });
});
router.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, propic } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) throw new Error("User already exists.");

      const user = await User.create({ name, email, password, propic });

      const authToken = user.genAuthToken();
      const refreshToken = user.genRefreshToken();

      res.status(201).json({
        message: "User created successfully.",
        user,
        refreshToken,
        authToken,
      });
    } catch (error) {
      console.log(error);
      // res.status(400).json(error);
      next(error);
    }
  }
);

export default router;
