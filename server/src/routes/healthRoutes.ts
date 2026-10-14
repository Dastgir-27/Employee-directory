import { Router } from "express";
import { pool } from "../config/db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "up" });
  } catch {
    res.status(503).json({
      error: { code: "DATABASE_UNAVAILABLE", message: "Database is unavailable." },
    });
  }
});

export default router;
