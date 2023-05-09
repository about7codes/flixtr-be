import mongoose, { Document, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface IUser {
  name: string;
  email: string;
  password: string;
  propic: number;
  genAuthToken: () => string;
  genRefreshToken: () => string;
}

export interface IUserModel extends IUser, Document {}

const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 6,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    propic: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Generate a JWT and return it
userSchema.methods.genAuthToken = function () {
  const user = this as IUserModel;

  const token = jwt.sign(
    { id: user._id.toString() },
    config.server.jwtAuthSecret,
    {
      expiresIn: "15m",
    }
  );

  return token;
};

// Generate a Refresh JWT and return it
userSchema.methods.genRefreshToken = function () {
  const user = this as IUserModel;

  const token = jwt.sign(
    { id: user._id.toString() },
    config.server.jwtRefreshSecret,
    {
      expiresIn: "1d",
    }
  );

  return token;
};

const User = mongoose.model<IUserModel>("User", userSchema);

export default User;
