require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const data = require('./data.json');

const app = express();
app.use(express.json());

const token = process.env.BOT_TOKEN;
const channelId = process.env.CHANNEL_ID;
const bot = new TelegramBot(token, { polling: false });

const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key';

app.get('/post', async (req, res) => {
  try {
    await postNextItem();
    res.json({ success: true, message: 'Posted!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cron', (req, res) => {
  if (req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  postNextItem()
    .then(() => res.json({ success: true }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.message });
    });
});

let currentIndex = parseInt(fs.readFileSync('index.txt', 'utf8') || '0');

async function postNextItem() {
  if (currentIndex >= data.length) {
    console.log('All posts done!');
    return;
  }

  const post = data[currentIndex];
  let sent = false;

  try {
    await bot.sendPhoto(channelId, post.imageUrl, {
      caption: post.text,
      parse_mode: 'HTML' // Changed to HTML5
    });
    sent = true;
    console.log(`Posted item ${currentIndex + 1}: ${post.text.substring(0, 50)}...`);
  } catch (error) {
    console.error('Post failed:', error);
  }

  if (sent) {
    currentIndex++;
    fs.writeFileSync('index.txt', currentIndex.toString());
  }
}

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}
