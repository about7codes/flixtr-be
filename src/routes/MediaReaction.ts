import express from "express";
import { addReaction, getMediaReactions } from "../controllers/MediaReaction";

const router = express.Router();

// POST vote or update reaction
router.post("/", addReaction);

// Get Reactions for a Movie or Episode
router.get("/", getMediaReactions);

export default router;
