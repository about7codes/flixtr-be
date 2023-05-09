import { NextFunction, Request, Response } from "express";

const ErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(error);

  if (error instanceof Error) {
    res.status(400).json({ error: error.message });
  }
  res.status(500).json({ error: "Something went wrong." });
};

export default ErrorHandler;
