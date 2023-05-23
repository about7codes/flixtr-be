import { NextFunction, Request, Response } from "express";
import Watchlist from "../models/Watchlist";

// Find media by id
export const mediaById = async (
  req: Request,
  res: Response,
  next: NextFunction,
  mediaId: number
) => {
  try {
    const media = await Watchlist.findOne({
      owner: req.user?._id,
      tmdb_id: mediaId,
    });

    if (!media) throw new Error("Media item not found.");

    req.media = media;
    next();
  } catch (error) {
    next(error);
  }
};

export const getWatchlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryObject = {
      owner: req.user?._id,
    };

    const options = {
      page: (req.query.page as unknown as number) || 1,
      limit: 20,
    };

    const userWatchlist = await Watchlist.paginate(queryObject, options);

    if (!userWatchlist || userWatchlist.totalDocs === 0)
      throw new Error("Nothing added to watchlist yet.");

    const { docs, page, totalPages, totalDocs } = userWatchlist;

    return res.status(200).json({
      results: docs,
      page: page,
      total_pages: totalPages,
      total_results: totalDocs,
    });
  } catch (error) {
    next(error);
  }
};

export const addToWatchlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tmdb_id, media_type, media_name, release_date, poster_path } =
      req.body;

    const mediaExists = await Watchlist.findOne({
      owner: req.user?._id,
      tmdb_id: tmdb_id,
    });
    if (mediaExists) throw new Error("Already exists in your watchlist.");

    const media = await Watchlist.create({
      owner: req.user?._id,
      tmdb_id,
      media_type,
      media_name,
      release_date,
      poster_path,
    });

    return res.status(201).json({ message: "Added to watchlist", media });
  } catch (error) {
    next(error);
  }
};

export const emptyWatchlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deletedMedia = await Watchlist.deleteMany({ owner: req.user?._id });

    return res.status(200).json({
      message: deletedMedia.deletedCount + " removed from watchlist.",
    });
  } catch (error) {
    next(error);
  }
};

export const getMediaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { media } = req;

    return res.status(200).json({ media });
  } catch (error) {
    next(error);
  }
};

export const deleteMediaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { media } = req;

    const media_type = media?.media_type === "tv" ? "Series" : "Movie";

    await media?.deleteOne();

    return res
      .status(200)
      .json({ message: media_type + " removed from watchlist." });
  } catch (error) {
    next(error);
  }
};
