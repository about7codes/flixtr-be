import { NextFunction, Request, Response } from "express";
import MediaReaction, { ReactionType } from "../models/MediaReaction";

interface ReactionRequestBody {
  anonymousId: string;
  mediaType: "movie" | "tv";
  mediaId: string;
  season?: number;
  episode?: number;
  type: ReactionType;
}

// POST vote or update reaction
export const addReaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      mediaType,
      mediaId,
      season,
      episode,
      type,
      anonymousId,
    }: ReactionRequestBody = req.body;

    if (!mediaType || !mediaId || !type || !anonymousId) {
      throw new Error("Missing required fields");
    }

    const query = {
      mediaType,
      mediaId,
      anonymousId,
      ...(mediaType === "tv" && season !== undefined ? { season } : {}),
      ...(mediaType === "tv" && episode !== undefined ? { episode } : {}),
    };

    const existing = await MediaReaction.findOne(query);

    if (existing) {
      if (existing.type === type) {
        return res.status(200).json({ message: "Reaction already recorded" });
      }

      existing.type = type;
      await existing.save();
      return res.status(200).json({ message: "Reaction updated" });
    }

    await MediaReaction.create({ ...query, type });
    res.status(201).json({ message: "Reaction recorded" });
  } catch (err) {
    next(err);
  }
};

// Get Reactions for a Movie or Episode
export const getMediaReactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mediaType, mediaId, season, episode, anonymousId } = req.query;

    if (!mediaType || !mediaId) {
      // return res.status(400).json({ error: "Missing mediaType or mediaId" });
      throw new Error("Missing mediaType or mediaId");
    }

    const match: Record<string, any> = {
      mediaType,
      mediaId,
    };

    if (season !== undefined) match.season = Number(season);
    if (episode !== undefined) match.episode = Number(episode);

    const counts = await MediaReaction.aggregate([
      { $match: match },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    const result: Record<string, number> = {
      upvote: 0,
      funny: 0,
      love: 0,
      surprised: 0,
      angry: 0,
      sad: 0,
    };

    counts.forEach((c) => {
      result[c._id] = c.count;
    });

    // Optionally get user's own reaction
    let userReaction: string | null = null;
    if (anonymousId) {
      const userMatch = { ...match, anonymousId };
      const userReactionDoc = await MediaReaction.findOne(userMatch);
      userReaction = userReactionDoc?.type ?? null;
    }

    res.json({ counts: result, userReaction });
  } catch (err) {
    // res.status(500).json({ error: (err as Error).message });
    next(err);
  }
};
