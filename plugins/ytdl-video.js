const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: "setmenuimg",
  alias: ["menuimg", "setmenu"],
  desc: "Change the bot menu image URL.",
  category: "settings",
  filename: __filename,
}, async (conn, mek, m, { args, isOwner, reply }) => {
  if (!isOwner) return reply("🚫 *Only the owner can use this command!*");

  if (!args[0]) return reply("❌ *Please provide a new image URL.*\n\nExample:\n.setmenuimg https://files.catbox.moe/abcd12.jpg");

  const newUrl = args[0].trim();
  const configPath = path.join(__dirname, '..', 'config.env');

  try {
    // ✅ Read existing env file
    let envData = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf-8') : '';

    // ✅ Update or append the MENU_IMAGE_URL
    if (envData.includes('MENU_IMAGE_URL=')) {
      envData = envData.replace(/MENU_IMAGE_URL=.*/g, `MENU_IMAGE_URL=${newUrl}`);
    } else {
      envData += `\nMENU_IMAGE_URL=${newUrl}`;
    }

    // ✅ Write updated data back
    fs.writeFileSync(configPath, envData);

    // ✅ Update in-memory config instantly
    config.MENU_IMAGE_URL = newUrl;

    // ✅ Confirmation message
    await reply(`✅ *Menu image URL updated successfully!*\n🖼️ New Image: ${newUrl}`);

    // ✅ Add reaction
    await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

  } catch (err) {
    console.error(err);
    await reply("❌ *Failed to update menu image URL.*");
  }
});
