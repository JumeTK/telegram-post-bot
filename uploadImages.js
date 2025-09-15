const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const path = require('path');
const data = require('./data.json');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dckf9bjeb',
  api_key: '713683783234855',
  api_secret: 'tACSN09sFtPrW4uKsGy1mWoEraE'
});

const imageDir = '/sdcard/images'; // Adjust to your image folder

async function uploadImages() {
  const updatedData = [];

  for (const post of data) {
    try {
      const imagePath = path.join(imageDir, post.imagePath);
      const result = await cloudinary.uploader.upload(imagePath, {
        upload_preset: 'zco5xh3y',
        folder: 'telegram-bot'
      });
      updatedData.push({
        text: post.text,
        imageUrl: result.secure_url
      });
      console.log(`Uploaded: ${post.imagePath} -> ${result.secure_url}`);
    } catch (error) {
      console.error(`Failed to upload ${post.imagePath}:`, error);
    }
  }

  // Save updated data.json
  await fs.writeFile('data.json', JSON.stringify(updatedData, null, 2));
  console.log('Updated data.json with Cloudinary URLs');
}

uploadImages();
