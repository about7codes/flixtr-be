import express, { NextFunction, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import Comment from "../models/Comment";

const router = express.Router();

// POST /comments
router.post(
  "/add",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tmdb_id, media_type, content, parentComment, season, episode } =
        req.body;

      const commentData: any = {
        owner: req.user?._id,
        tmdb_id,
        media_type,
        content,
        parentComment: parentComment || null,
      };

      if (media_type === "tv") {
        commentData.season = season;
        commentData.episode = episode;
      }

      const comment = await Comment.create(commentData);

      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }
);

// PUT update an existing comment /comments/:id
router.put(
  "/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment)
        return res.status(404).json({ message: "Comment not found." });

      if (!comment.owner.equals(req.user!._id))
        return res
          .status(403)
          .json({ message: "You can only edit your own comments." });

      comment.content = req.body.content;
      await comment.save();

      res.status(200).json(comment);
    } catch (error) {
      next(error);
    }
  }
);

// GET /comments/:media_type/:tmdb_id?season=&episode=&page=&limit=
router.get("/:media_type/:tmdb_id", async (req, res, next) => {
  try {
    const { media_type, tmdb_id } = req.params;
    const { season, episode, page = 1, limit = 10 } = req.query;

    const filter: any = {
      media_type,
      tmdb_id: Number(tmdb_id),
    };

    // Validate and add season/episode for TV
    if (media_type === "tv") {
      if (season === undefined || episode === undefined) {
        return res.status(400).json({
          message: "Season and episode are required for TV comments.",
        });
      }

      filter.season = Number(season);
      filter.episode = Number(episode);
    }

    // Get all comments (including replies)
    const allComments = await Comment.find(filter)
      .sort({ createdAt: -1 }) // Newest first
      .populate("owner", "name propic")
      .lean();

    const commentMap: Record<string, any> = {};
    const rootComments: any[] = [];

    // Initialize replies and build map
    allComments.forEach((comment) => {
      // @ts-ignore
      comment.replies = [];
      commentMap[comment._id.toString()] = comment;
    });

    // Thread replies under parent
    allComments.forEach((comment) => {
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment.toString()];
        if (parent) parent.replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    // Pagination logic for root comments
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedRootComments = rootComments.slice(startIndex, endIndex);

    res.status(200).json({
      totalRootComments: rootComments.length,
      totalAllComments: allComments.length,
      page: Number(page),
      limit: Number(limit),
      comments: paginatedRootComments,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE soft delete a comment /comments/:id
router.delete(
  "/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment)
        return res.status(404).json({ message: "Comment not found." });

      if (!comment.owner.equals(req.user!._id))
        return res
          .status(403)
          .json({ message: "You can only delete your own comments." });

      comment.content = "[deleted]";
      await comment.save();

      res.status(200).json(comment);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
