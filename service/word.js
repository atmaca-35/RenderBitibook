import { Word } from "../model/word.js";

const readAllWords = async () => {
  return Word.find({});
};

const countWords = async () => {
  const result = await Word.countDocuments();

  return result;
};

const findWord = async (word) => {
  const result = await Word.findOne({ word });

  return result;
};

const searchWord = async (word) => {
  const results = await Word.find({ word: { $regex: `^${word}` } }).limit(5);

  return results;
};

const saveWord = async (data) => {
  const exists = await Word.findOne({ word: data.word });

  if (exists) {
    return false;
  }

  const related = [];

  if (data.related_words) {
    data.related_words.forEach((w) => {
      w.trim();

      if (w.length) {
        related.push(w);
      }
    });
  }

  const word = new Word({ ...data, related_words: related });

  await word.save();

  return true;
};

const updateWord = async (word, data) => {
  await Word.findOneAndUpdate({ word: word }, { ...data });
};

export { saveWord, findWord, searchWord, countWords, updateWord, readAllWords };
