import express from "express";
import { Redis } from "@upstash/redis";
import TelegramBot from "node-telegram-bot-api";
//import data from "./data.json" assert { type: "json" };
import fs from "fs";
import path from "path";

const data = JSON.parse(
  fs.readFileSync(path.resolve("./data.json"), "utf-8")
);
const app = express();
app.use(express.json());

// Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// Telegram bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * POST /post
 * Sends the next item to Telegram
 */
app.post("/post", async (req, res) => {
  if (req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    let currentIndex = await redis.get("currentIndex");
    currentIndex = parseInt(currentIndex || "0");

    if (currentIndex >= data.length) {
      return res.json({ success: false, message: "All posts done!" });
    }

    const post = data[currentIndex];

    await bot.sendPhoto(process.env.CHANNEL_ID, post.imageUrl, {
      caption: post.text,
      parse_mode: "HTML",
    });

    await redis.set("currentIndex", currentIndex + 1);

    res.json({ success: true, message: `Posted item ${currentIndex + 1}` });
  } catch (err) {
    console.error("Post failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// Export for Vercel
export default app;
