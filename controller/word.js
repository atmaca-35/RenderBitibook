import express from "express";
import {
  saveWord,
  findWord,
  countWords,
  updateWord,
  searchWord,
} from "../service/word.js";
import { isAdmin } from "../service/admin.js";

const wordRouter = express.Router();

function simpleValidation(word, description) {
  if (!word || !description) {
    return false;
  }

  if (word.length < 2 || description.length < 6) {
    return false;
  }

  return true;
}

wordRouter.post("/", async (req, res) => {
  if (!simpleValidation(req.body.word, req.body.description)) {
    return res.status(400).json();
  }

  if (!req.body.user || !req.body.user.username || !req.body.user.password) {
    return res.status(403).json();
  }

  const admin = await isAdmin(req.body.user.username, req.body.user.password);

  if (!admin) {
    return res.status(403).json();
  }

  const related = [];

  if (req.body.related_words) {
    req.body.related_words.forEach((w) => {
      if (w.trim().length > 1) {
        related.push(w.trim());
      }
    });
  }

  const saved = await saveWord({
    word: req.body.word,
    description: req.body.description,
    related_words: related,
  });

  if (!saved) {
    return res.status(404).json({});
  }

  return res.status(201).json({ data: true });
});

wordRouter.put("/:word", async (req, res) => {
  if (req.params.word.length < 2) {
    return res.status(403).json();
  }

  if (!req.body.user || !req.body.user.username || !req.body.user.password) {
    return res.status(403).json();
  }

  const admin = await isAdmin(req.body.user.username, req.body.user.password);

  if (!admin) {
    return res.status(403).json();
  }

  const update = { ...req.body };

  if (req.body.related_words) {
    const related = [];

    req.body.related_words.forEach((w) => {
      if (w.trim().length > 1) {
        related.push(w.trim());
      }
    });

    update["related_words"] = related;
  }

  await updateWord(req.params.word, update);

  return res.status(201).json({ data: true });
});

wordRouter.get("/add", (req, res) => {
  res.render("add_word");
});

wordRouter.get("/update", (req, res) => {
  res.render("update_word");
});

wordRouter.get("/count", async (req, res) => {
  return res.status(200).json({ data: await countWords() });
});

wordRouter.get("/direct/:word", async (req, res) => {
  if (req.params.word.length < 1) {
    return res.status(400).json();
  }

  const word = req.params.word;

  const result = await findWord(word);

  return res.json({
    data: result,
  });
});

wordRouter.get("/search", async (req, res) => {
  const query = req.query.q;

  let words;

  if (query.length >= 1) {
    words = await searchWord(query);
  }

  return res.json({
    data: words || [],
  });
});

export { wordRouter };
