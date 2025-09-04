import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";

const app = express();
app.use(cors());
app.use(express.json());

/**
 * In-memory store. For a production demo,
 * replace with Redis or a database.
 */
const linkRecords = new Map(); // id -> { target, expiry, clicks }
const history = [];            // audit trail

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Create short link - POST /create
app.post("/create", (req, res) => {
  const { targetUrl, ttl } = req.body || {};
  if (!targetUrl || typeof targetUrl !== "string") {
    return res.status(400).json({ message: "targetUrl is required" });
  }
  const minutes = Number.isFinite(ttl) ? Math.max(1, ttl) : 5;
  const id = nanoid(7);
  const expiry = Date.now() + minutes * 60 * 1000;

  linkRecords.set(id, { target: targetUrl, expiry, clicks: 0 });
  history.push({ id, targetUrl, expiry, createdAt: new Date().toISOString() });

  res.json({ shortLink: `http://localhost:5000/${id}`, id, expiresAt: expiry });
});

// Redirect - GET /:code
app.get("/:code", (req, res) => {
  const code = req.params.code;
  const record = linkRecords.get(code);
  if (!record) return res.status(404).send("This link does not exist.");
  if (Date.now() > record.expiry) return res.status(410).send("This link has expired.");
  record.clicks++;
  return res.redirect(record.target);
});

// History - GET /history
app.get("/history", (_req, res) => {
  const enriched = history.map(h => ({
    ...h,
    clicks: linkRecords.get(h.id)?.clicks ?? 0
  }));
  res.json(enriched);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✨ Unique backend running at http://localhost:${PORT}`);
});
