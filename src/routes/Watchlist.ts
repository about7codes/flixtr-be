import express, { NextFunction, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { Schema, Validator } from "../middleware/Validator";
import Watchlist from "../models/Watchlist";
import {
  addToWatchlist,
  deleteMediaById,
  emptyWatchlist,
  getMediaById,
  getWatchlist,
  mediaById,
} from "../controllers/Watchlist";

const router = express.Router();

// auth protect all watchlist routes
router.use(authenticate);

// TODO: add pagination
router.get("/all", getWatchlist);
router.get("/:mediaId", getMediaById);

router.post("/add", Validator(Schema.Watchlist.add), addToWatchlist);

router.delete("/deleteall", emptyWatchlist);
router.delete("/delete/:mediaId", deleteMediaById);

router.param("mediaId", mediaById);

export default router;
