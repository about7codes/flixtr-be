import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";

import "./helper/db";
import userRoutes from "./routes/User";
import watchlistRoutes from "./routes/Watchlist";
import commentRoutes from "./routes/Comments";
import mediaReactionRoutes from "./routes/MediaReaction";
import ErrorHandler from "./middleware/errorHandler";

const PORT = process.env.PORT || 8000;
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://flixbaba.com",
      "https://flixbaba.net",
      "https://www.flixbaba.com",
      "https://www.flixbaba.net",
      "https://dev.flixbaba.com",
      "https://flixtrzzz.netlify.app",
      "https://flixtrzzz.netlify.com",
      "https://flixtr.netlify.app",
      "https://flixtr.netlify.com",
      "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:6000",
      "http://localhost:6001",
    ],
    credentials: true,
  })
);

// Routes
app.use("/auth", userRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/comments", commentRoutes);
app.use("/mediareaction", mediaReactionRoutes);

// Server home route
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
