import mongoose, { Document, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
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
      maxlength: 20,
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

// Before saving the user, hash the password
userSchema.pre("save", async function (next) {
  const user = this as IUserModel;

  if (user.isModified("password")) {
    const hashedPassword = await bcrypt.hash(user.password, 8);
    user.password = hashedPassword;
  }

  next();
});

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

// Find a user by email and checking password
userSchema.methods.findByCredentials = async function (
  email: string,
  password: string
) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User does not exists.");

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) throw new Error("Invalid login credentials");

  return user;
};

const User = mongoose.model<IUserModel>("User", userSchema);

export default User;
