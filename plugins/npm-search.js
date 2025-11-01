const { cmd } = require('../command');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const fs = require('fs-extra');
const { exec } = require('child_process');
const path = require('path');

cmd({
  pattern: 'sticker',
  alias: ['sa', 'take', 'stake', 'stickergif'],
  desc: 'Create or rename a sticker. Reply to image/video/sticker. Optional pack name as argument.',
  category: 'sticker',
  filename: __filename,
}, async (conn, mek, m, { quoted, q, reply }) => {
  try {
    // Ensure a quoted message exists
    if (!mek.quoted) return reply('*⚠️ Please reply to an image, video, or sticker.*');

    // Determine pack name (argument) or default
    const packName = q && q.trim() ? q.trim() : (process.env.STICKER_NAME || 'MyPack');

    // Try to determine mimetype and duration (if available)
    const mime = mek.quoted.mtype || (mek.quoted.msg && mek.quoted.msg.mimetype) || '';
    let duration = null;
    if (mek.quoted.msg) {
      // attempt common properties where duration may be present
      duration = mek.quoted.msg.seconds || mek.quoted.msg.duration || (mek.quoted.msg.videoMessage && mek.quoted.msg.videoMessage.seconds);
    }

    // Download media buffer (baileys style)
    let mediaBuffer;
    try {
      mediaBuffer = await mek.quoted.download?.(); // some frameworks provide download() — try it
    } catch (err) {
      // fallback: if quoted has url field, try fetch (rare)
      mediaBuffer = null;
    }
    if (!mediaBuffer || !mediaBuffer.length) {
      return reply('❌ Failed to download media. Please try again with a different media or check bot permissions.');
    }

    // Helper to create sticker from final buffer (webp or original)
    const createAndSendSticker = async (buffer, options) => {
      const sticker = new Sticker(buffer, {
        pack: options.pack || packName,
        author: options.author || 'Sticker',
        type: options.animated ? StickerTypes.ANIMATED : StickerTypes.FULL,
        quality: 75,
        id: 'stkr_' + Date.now(),
        categories: ['🎉'],
      });
      const out = await sticker.toBuffer();
      await conn.sendMessage(mek.chat, { sticker: out }, { quoted: mek });
    };

    // If it's an image or sticker — create normal sticker
    if (mime.includes('image') || mek.quoted.mtype === 'stickerMessage') {
      await createAndSendSticker(mediaBuffer, { animated: false, pack: packName });
      return reply(`✅ Sticker created successfully!\n📦 Pack: ${packName}`);
    }

    // If it's a video — convert to webp animated sticker
    if (mime.includes('video')) {
      // Enforce duration if known
      if (duration && Number(duration) > 10) {
        return reply('❌ Video too long. Please use a clip of 10 seconds or shorter for an animated sticker.');
      }

      // Create temp files
      const tmpDir = path.join(__dirname, '../tmp');
      await fs.ensureDir(tmpDir);
      const inPath = path.join(tmpDir, `in_${Date.now()}.mp4`);
      const outPath = path.join(tmpDir, `out_${Date.now()}.webp`);

      // Write input video to disk
      await fs.writeFile(inPath, mediaBuffer);

      // ffmpeg command to convert short video to animated webp sticker (512x512)
      // adjust -t 10 to force max 10s
      const ffmpegCmd = `ffmpeg -y -i "${inPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease, pad=512:512:(ow-iw)/2:(oh-ih)/2, fps=15" -vcodec libwebp -lossless 0 -compression_level 6 -qscale 50 -preset default -an -loop 0 "${outPath}"`;

      // Execute ffmpeg
      await new Promise((resolve, reject) => {
        exec(ffmpegCmd, (err, stdout, stderr) => {
          if (err) {
            console.error('FFMPEG ERROR:', err, stderr);
            return reject(new Error('FFmpeg conversion failed'));
          }
          resolve();
        });
      });

      // Read output webp buffer
      const webpBuffer = await fs.readFile(outPath);

      // Create animated sticker from webp buffer
      await createAndSendSticker(webpBuffer, { animated: true, pack: packName });

      // Cleanup temp files
      await fs.remove(inPath).catch(()=>{});
      await fs.remove(outPath).catch(()=>{});

      return reply(`✅ Animated sticker created!\n📦 Pack: ${packName}`);
    }

    // Unknown media type
    return reply('⚠️ Unsupported media type. Reply to an image, sticker, or a short video (≤10s).');

  } catch (err) {
    console.error('STICKER COMMAND ERROR:', err);
    return reply(`❌ Failed to create sticker. Error: ${err.message || err}`);
  }
});
