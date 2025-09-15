// api/post.js (or index.js depending on your structure)
import { Redis } from "@upstash/redis";
import TelegramBot from "node-telegram-bot-api";
import data from "../../data.json";

// Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// Telegram bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

export default async function handler(req, res) {
  const CRON_SECRET = process.env.CRON_SECRET;

  if (req.method === "POST") {
    if (req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Get current index from Redis (default 0)
      let currentIndex = await redis.get("currentIndex");
      currentIndex = parseInt(currentIndex || "0");

      if (currentIndex >= data.length) {
        return res.json({ success: false, message: "All posts done!" });
      }

      const post = data[currentIndex];

      // Send to Telegram
      await bot.sendPhoto(process.env.CHANNEL_ID, post.imageUrl, {
        caption: post.text,
        parse_mode: "HTML",
      });

      // Update counter
      await redis.set("currentIndex", currentIndex + 1);

      return res.json({
        success: true,
        message: `Posted item ${currentIndex + 1}`,
      });
    } catch (err) {
      console.error("Post failed:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
