import dotenv from "dotenv";
dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || "";
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || "";
// const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.aeurg0f.mongodb.net/?retryWrites=true&w=majority`;
const MONGO_URL = process.env.MONGO_URL || "";
const MONGO_DB_NAME = process.env.DB_NAME || "";
// const MONGO_DB_NAME = "flixtr_dev";

const JWT_AUTH_SECRET = process.env.JWT_AUTH_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";
const domain = process.env.DOMAIN || "";

export const config = {
  mongodb: {
    url: MONGO_URL,
    databaseName: MONGO_DB_NAME,
  },
  server: {
    jwtAuthSecret: JWT_AUTH_SECRET,
    jwtRefreshSecret: JWT_REFRESH_SECRET,
    domain: domain,
  },
};
