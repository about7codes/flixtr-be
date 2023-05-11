import express, { NextFunction, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { Schema, Validator } from "../middleware/Validator";

const router = express.Router();

router.use(authenticate);

router.get("/all", async (req: Request, res: Response, next: NextFunction) => {
  res.json({ watchlist: "all" });
});

router.post(
  "/add",
  Validator(Schema.Watchlist.add),
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ watchlist: "add" });
  }
);

router.delete(
  "/delete",
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ watchlist: "del 1" });
  }
);

router.delete(
  "/deleteall",
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ watchlist: "del all" });
  }
);

export default router;
