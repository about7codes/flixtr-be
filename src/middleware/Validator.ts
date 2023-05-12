import { NextFunction, Request, Response } from "express";
import Joi, { ObjectSchema } from "joi";
import { IUser } from "../models/User";
import { IWatchlist } from "../models/Watchlist";

// Data validation middleware
export const Validator = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const Schema = {
  User: {
    // Validation for Signup User route
    signup: Joi.object<IUser>({
      name: Joi.string().max(20).required().messages({
        "string.empty": "Name is required.",
        "string.max": "Name must be of 20 characters max.",
      }),
      email: Joi.string().email().required().messages({
        "string.empty": "Email is required.",
        "string.email": "Email is invalid.",
      }),
      password: Joi.string().min(6).required().messages({
        "string.empty": "Password is required.",
        "string.min": "Password must be at least 6 characters.",
      }),
      propic: Joi.number().max(10).required().messages({
        "number.empty": "Profile ico is required.",
        "number.max": "Profile ico must less than 10.",
      }),
    }),
    // Validation for Signin User route
    signin: Joi.object<IUser>({
      email: Joi.string().email().required().messages({
        "string.empty": "Email is required.",
        "string.email": "Email is invalid.",
      }),
      password: Joi.string().required().messages({
        "string.empty": "Password is required.",
      }),
    }),
  },

  Watchlist: {
    add: Joi.object<IWatchlist>({
      tmdb_id: Joi.string().required().messages({
        "string.empty": "tmdb_id is required.",
      }),
      media_type: Joi.string().required().valid("movie", "tv").messages({
        "string.empty": "media_type is required.",
      }),
      media_name: Joi.string().required().messages({
        "string.empty": "media_name is required.",
      }),
      release_date: Joi.string().required().messages({
        "string.empty": "release_date is required.",
      }),
      poster_path: Joi.string().required().messages({
        "string.empty": "poster_path is required.",
      }),
    }),
  },
};
