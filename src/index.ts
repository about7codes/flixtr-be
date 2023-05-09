import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";

import "./helper/db";
import UserRoutes from "./routes/User";
import ErrorHandler from "./middleware/errorHandler";

const PORT = process.env.PORT || 8000;
const app = express();

app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/auth", UserRoutes);

// Server ping route
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello fellow developer." });
});

// Server ping route
app.get("/ping", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "pong" });
});

// 404 route handler
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler middleware
app.use(ErrorHandler);

// Start server
app.listen(PORT, () => {
  console.log("Running node server on port: " + PORT);
});
