import { NextFunction, Request, Response } from "express";
import Comment from "../models/Comment";

// Add a new comment
export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tmdb_id, media_type, content, parentComment, season, episode } =
      req.body;

    if (!tmdb_id || !media_type || !content) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const commentData: any = {
      owner: req.user?._id,
      tmdb_id,
      media_type,
      content,
      parentComment: parentComment || null,
    };

    if (media_type === "tv") {
      if (season === undefined || episode === undefined) {
        return res
          .status(400)
          .json({ error: "TV comments require season and episode." });
      }

      commentData.season = season;
      commentData.episode = episode;
    }

    const comment = await Comment.create(commentData);

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// Update an existing comment
export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found." });

    if (!comment.owner.equals(req.user!._id))
      return res
        .status(403)
        .json({ error: "You can only edit your own comments." });

    comment.content = req.body.content;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

// Get comments by media type and ID
// export const getCommentsByMedia = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { media_type, tmdb_id } = req.params;
//     const { season, episode, page = 1, limit = 10 } = req.query;

//     const filter: any = {
//       media_type,
//       tmdb_id: Number(tmdb_id),
//     };

//     // Validate and add season/episode for TV
//     if (media_type === "tv") {
//       if (season === undefined || episode === undefined) {
//         return res.status(400).json({
//           error: "Season and episode are required for TV comments.",
//         });
//       }

//       filter.season = Number(season);
//       filter.episode = Number(episode);
//     }

//     // Get all comments (including replies)
//     const allComments = await Comment.find(filter)
//       .sort({ createdAt: -1 }) // Newest first
//       .populate("owner", "name propic")
//       .lean();

//     const commentMap: Record<string, any> = {};
//     const rootComments: any[] = [];

//     // Initialize replies and build map
//     allComments.forEach((comment) => {
//       // @ts-ignore
//       comment.replies = [];
//       commentMap[comment._id.toString()] = comment;
//     });

//     // Thread replies under parent
//     allComments.forEach((comment) => {
//       if (comment.parentComment) {
//         const parent = commentMap[comment.parentComment.toString()];
//         if (parent) parent.replies.push(comment);
//       } else {
//         rootComments.push(comment);
//       }
//     });

//     // Pagination logic for root comments
//     const startIndex = (Number(page) - 1) * Number(limit);
//     const endIndex = startIndex + Number(limit);
//     const paginatedRootComments = rootComments.slice(startIndex, endIndex);

//     res.status(200).json({
//       totalRootComments: rootComments.length,
//       totalAllComments: allComments.length,
//       page: Number(page),
//       limit: Number(limit),
//       comments: paginatedRootComments,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// GET /comments/:media_type/:tmdb_id?season=&episode=&page=&limit=
export const getCommentsByMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { media_type, tmdb_id } = req.params;
    const { season, episode, page = 1, limit = 10 } = req.query;

    // Validate required fields
    if (!media_type || !tmdb_id) {
      return res.status(400).json({ error: "Missing media_type or tmdb_id." });
    }

    // Validate season/episode for TV
    if (
      media_type === "tv" &&
      (season === undefined || episode === undefined)
    ) {
      return res
        .status(400)
        .json({ error: "Season and episode are required for TV comments." });
    }

    const filter: any = {
      media_type,
      tmdb_id: Number(tmdb_id),
      ...(media_type === "tv" && {
        season: Number(season),
        episode: Number(episode),
      }),
    };

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    // 1. Fetch paginated root comments (top-level comments only)
    const rootFilter = { ...filter, parentComment: null };

    const rootComments = await Comment.find(rootFilter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate("owner", "name propic")
      .lean();

    // 2. Fetch ALL replies (regardless of depth) for current filter
    const allReplies = await Comment.find({
      ...filter,
      parentComment: { $ne: null },
    })
      .sort({ createdAt: 1 }) // show oldest replies first
      .populate("owner", "name propic")
      .lean();

    // 3. Build a map of all comments (root + replies)
    const allComments = [...rootComments, ...allReplies];
    const commentMap: Record<string, any> = {};

    allComments.forEach((comment) => {
      // @ts-ignore
      comment.replies = [];
      commentMap[comment._id.toString()] = comment;
    });

    // 4. Attach each reply to its correct parent
    allReplies.forEach((reply) => {
      // @ts-ignore
      const parentId = reply.parentComment.toString();
      const parent = commentMap[parentId];
      if (parent) {
        parent.replies.push(reply);
      }
    });

    // 5. Get total root comment count (for pagination)
    const totalRootComments = await Comment.countDocuments(rootFilter);

    // 6. Return only root comments, replies are nested
    res.status(200).json({
      totalRootComments,
      totalAllComments: totalRootComments + allReplies.length,
      page: pageNumber,
      limit: limitNumber,
      comments: rootComments,
    });
  } catch (error) {
    next(error);
  }
};

// Soft delete a comment (mark as deleted)
export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found." });

    if (!comment.owner.equals(req.user!._id))
      return res
        .status(403)
        .json({ error: "You can only delete your own comments." });

    comment.content = "[deleted]";
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};
