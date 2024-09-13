import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { wordRouter } from "./controller/word.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/words/", wordRouter);

app.listen(3000, async () => {
  console.log("Server started successfully.");

  if (process.env.DATABASE_URI) {
    try {
      await mongoose.connect(process.env.DATABASE_URI);

      console.log("Database connection established.");
    } catch (error) {
      console.log("Database connection failed.");
      console.log(error);
    }
  }
});
