import { Router } from "express";
import { GRAMMAR_LESSONS, READING_PASSAGES } from "@workspace/learning-content";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

router.get("/grammar-lessons", requireAuth, (req, res) => {
  const level = typeof req.query.level === "string" ? req.query.level : null;
  const lessons = level && LEVELS.has(level)
    ? GRAMMAR_LESSONS.filter((l) => l.level === level)
    : GRAMMAR_LESSONS;
  return res.json({ lessons });
});

router.get("/reading-passages", requireAuth, (req, res) => {
  const level = typeof req.query.level === "string" ? req.query.level : null;
  const passages = level && LEVELS.has(level)
    ? READING_PASSAGES.filter((p) => p.level === level)
    : READING_PASSAGES;
  return res.json({ passages });
});

export default router;
