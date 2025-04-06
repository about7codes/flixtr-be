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
      const { tmdb_id, media_type, content, parentComment } = req.body;

      const comment = await Comment.create({
        owner: req.user?._id,
        tmdb_id,
        media_type,
        content,
        parentComment: parentComment || null,
      });

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

// GET comments via tmdbId /comments/:media_type/:tmdb_id
router.get("/:media_type/:tmdb_id", async (req, res, next) => {
  try {
    const { media_type, tmdb_id } = req.params;

    const comments = await Comment.find({
      media_type,
      tmdb_id,
    })
      .populate("owner", "name propic")
      .lean();

    const commentMap: any = {};
    const rootComments: any[] = [];

    comments.forEach((comment) => {
      // @ts-ignore
      comment.replies = [];
      commentMap[comment._id.toString()] = comment;
    });

    comments.forEach((comment) => {
      if (comment.parentComment) {
        commentMap[comment.parentComment.toString()].replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    res.status(200).json(rootComments);
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
