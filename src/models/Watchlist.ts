import mongoose, { Document, Schema } from "mongoose";

export interface IWatchlist {
  tmdb_id: string;
  media_type: string;
  media_name: string;
  release_date: string;
  poster_path: string;
}

export interface IWatchlistModel extends IWatchlist, Document {}

const watchlistSchema: Schema = new Schema(
  {
    tmdb_id: {
      type: String,
      required: true,
      trim: true,
    },
    media_type: {
      type: String,
      enum: ["movie", "tv"],
      required: true,
    },
    media_name: {
      type: String,
      required: true,
      trim: true,
    },
    release_date: {
      type: String,
      required: true,
      trim: true,
    },
    poster_path: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const Watchlist = mongoose.model<IWatchlistModel>("Watchlist", watchlistSchema);

export default Watchlist;
