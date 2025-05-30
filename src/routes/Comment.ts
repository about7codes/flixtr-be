import express, { NextFunction, Request, Response } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
  addComment,
  updateComment,
  deleteComment,
  getCommentsByMedia,
  getAllComments,
  deleteCommentById,
} from "../controllers/Comment";

const router = express.Router();

// POST /comments
router.post("/add", authenticate, addComment);

// PUT update an existing comment /comments/:id
router.put("/:id", authenticate, updateComment);

// GET /comments/:media_type/:tmdb_id?season=&episode=&page=&limit=
router.get("/:media_type/:tmdb_id", getCommentsByMedia);

// DELETE soft delete a comment /comments/:id
router.delete("/:id", authenticate, deleteComment);

// GET /comments/admin (admin only)
router.get("/admin", authenticate, requireAdmin, getAllComments);

// DELETE /comments/admin/:id (admin only)
router.delete("/admin/:id", authenticate, requireAdmin, deleteCommentById);

export default router;
