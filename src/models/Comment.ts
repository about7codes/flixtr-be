import mongoose, { Document, Schema } from "mongoose";

export interface IComment {
  owner: mongoose.Types.ObjectId;
  tmdb_id: number;
  media_type: "movie" | "tv";
  content: string;
  parentComment?: mongoose.Types.ObjectId | null;
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
  },
  { timestamps: true }
);

const Comment = mongoose.model<ICommentModel>("Comment", commentSchema);

export default Comment;
