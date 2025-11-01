const { cmd } = require('../command');
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const Config = require('../config');

cmd({
  pattern: 'sticker',
  alias: ['sa', 'take', 'stake', 'stickergif'],
  desc: 'Create or rename a sticker (image, video, or sticker).',
  category: 'sticker',
  use: '.sticker <optional pack name>',
  filename: __filename,
}, async (conn, mek, m, { quoted, args, q, reply }) => {

  if (!mek.quoted) return reply("*⚠️ Please reply to an image, video, or sticker.*");

  try {
    const mime = mek.quoted.mtype;
    const packName = q ? q.trim() : (Config.STICKER_NAME || "Erfan Ahmad");
    let media = await mek.quoted.download();

    if (!media) return reply("❌ Failed to download media.");

    // Choose sticker type
    let stickerType = StickerTypes.FULL;

    // 🎨 Create sticker
    const sticker = new Sticker(media, {
      pack: packName, // Custom or default pack name
      author: "Erfan Tech", // You can change this default name
      type: stickerType,
      categories: ["🔥", "🎉"],
      id: "ErfanTech_" + Date.now(),
      quality: 75,
      background: 'transparent',
    });

    const buffer = await sticker.toBuffer();

    await conn.sendMessage(mek.chat, { sticker: buffer }, { quoted: mek });

    return reply(`✅ Sticker created successfully!\n📦 Pack: *${packName}*`);

  } catch (e) {
    console.error("❌ Sticker Error:", e);
    reply("❌ Failed to create sticker. Please try again.");
  }
});
