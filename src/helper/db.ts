import mongoose from "mongoose";
import { config } from "../config";

mongoose
  .connect(config.mongodb.url, { dbName: config.mongodb.databaseName })
  .then(() => console.log("MongoDB is connected..."))
  .catch((e) => console.log(e));
