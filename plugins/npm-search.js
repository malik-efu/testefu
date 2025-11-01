const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs-extra');
const FormData = require('form-data');
const path = require('path');
const { exec } = require('child_process');

cmd({
  pattern: 'bgrem',
  alias: ['removebg', 'background'],
  desc: 'Remove or replace background from image/video using Unscreen API.',
  category: 'tools',
  filename: __filename,
}, async (conn, mek, m, { quoted, reply }) => {
  try {
    if (!mek.quoted) return reply('📸 *Reply to an image or video to remove background!*');

    const mime = mek.quoted.mtype || '';
    if (!mime.includes('image') && !mime.includes('video'))
      return reply('❌ *Only image or video files are supported.*');

    const mediaBuffer = await mek.quoted.download();
    if (!mediaBuffer) return reply('❌ Failed to download media.');

    await fs.ensureDir('./tmp');
    const inputPath = path.join('./tmp', `input_${Date.now()}.${mime.includes('video') ? 'mp4' : 'jpg'}`);
    const outputPath = path.join('./tmp', `output_${Date.now()}.mp4`);
    await fs.writeFile(inputPath, mediaBuffer);

    reply('⏳ *Removing background, please wait...*');

    // Upload to Unscreen
    const form = new FormData();
    form.append('video_file', fs.createReadStream(inputPath));
    form.append('format', 'mp4');
    form.append('bg_image', 'bedroom.jpg'); // 🛏️ You can use URL too (e.g. https://example.com/bg.jpg)

    const response = await axios.post('https://api.unscreen.com/v1.0/videos', form, {
      headers: {
        ...form.getHeaders(),
        'X-Api-Key': 'HbTJ9KjEiNQad1PhkMNNxe6s', // 🔑 Replace with your valid key
      },
      responseType: 'arraybuffer',
    });

    // Save result
    await fs.writeFile(outputPath, response.data);

    await conn.sendMessage(mek.chat, {
      video: fs.readFileSync(outputPath),
      caption: '✅ *Background changed successfully!*',
    }, { quoted: mek });

    await fs.remove(inputPath);
    await fs.remove(outputPath);
  } catch (err) {
    console.error(err);
    reply('❌ *Failed to process media.* Possible issues:\n• API key invalid\n• Large video\n• Network error\n• Unscreen API limit reached.');
  }
});
