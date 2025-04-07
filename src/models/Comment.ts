import mongoose, { Document, Schema } from "mongoose";

export interface IComment {
  owner: mongoose.Types.ObjectId;
  tmdb_id: number;
  media_type: "movie" | "tv";
  content: string;
  parentComment?: mongoose.Types.ObjectId | null;
  season?: number; // only for "tv"
  episode?: number; // only for "tv"
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICommentModel extends IComment, Document {}

const commentSchema: Schema = new Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tmdb_id: { type: Number, required: true },
    media_type: { type: String, enum: ["movie", "tv"], required: true },
    content: { type: String, required: true },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    }, // null for top-level
    season: {
      type: Number,
      required: function (this: IComment) {
        return this.media_type === "tv";
      },
    },
    episode: {
      type: Number,
      required: function (this: IComment) {
        return this.media_type === "tv";
      },
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model<ICommentModel>("Comment", commentSchema);

export default Comment;
