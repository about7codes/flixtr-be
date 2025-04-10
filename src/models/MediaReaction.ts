import mongoose, { Document, Schema } from "mongoose";

export const reactionTypes = [
  "upvote",
  "funny",
  "love",
  "surprised",
  "angry",
  "sad",
];
export type ReactionType = (typeof reactionTypes)[number];

export interface IMediaReaction {
  anonymousId: string;
  mediaType: "movie" | "tv";
  mediaId: string;
  season?: number;
  episode?: number;
  type: ReactionType;
}

export interface IMediaReactionModel extends IMediaReaction, Document {}

const mediaReactionSchema: Schema = new Schema(
  {
    anonymousId: { type: String, required: true },
    mediaType: { type: String, enum: ["movie", "tv"], required: true },
    mediaId: { type: String, required: true },
    season: {
      type: Number,
      required: function (this: IMediaReaction) {
        return this.mediaType === "tv";
      },
    },
    episode: {
      type: Number,
      required: function (this: IMediaReaction) {
        return this.mediaType === "tv";
      },
    },
    type: { type: String, enum: reactionTypes, required: true },
  },
  { timestamps: true }
);

mediaReactionSchema.index(
  {
    anonymousId: 1,
    mediaType: 1,
    mediaId: 1,
    season: 1,
    episode: 1,
    type: 1,
  },
  { unique: true }
);

const MediaReaction = mongoose.model<IMediaReactionModel>(
  "MediaReaction",
  mediaReactionSchema
);

export default MediaReaction;
