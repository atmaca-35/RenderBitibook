import mongoose from "mongoose";

const wordSchema = new mongoose.Schema(
  {
    word: String,
    description: String,
    related_words: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const Word = mongoose.model("Word", wordSchema);

export { Word };
