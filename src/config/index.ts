import dotenv from "dotenv";
dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || "";
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || "";
const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.wc4xq.mongodb.net/`;
const MONGO_DB_NAME = process.env.DB_NAME || "";

export const config = {
  mongodb: {
    url: MONGO_URL,
    databaseName: MONGO_DB_NAME,
  },
};
