const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');




cmd({
  pattern: "setmenuimg",
  alias: ["menuimg", "setmenu"],
  desc: "Change the bot menu image URL.",
  category: "settings",
  filename: __filename,
}, async (conn, mek, m, { args, isOwner, reply }) => {
  if (!isOwner) return reply("🚫 *Only owner can use this command!*");
  if (!args[0]) return reply("❌ *Please provide a new image URL.*\n\nExample:\n.setmenuimg https://files.catbox.moe/abcd12.jpg");

  const newUrl = args[0].trim();

  // ✅ Update config.env file safely
  let envData = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf-8") : "";
  if (envData.includes("MENU_IMAGE_URL=")) {
    envData = envData.replace(/MENU_IMAGE_URL=.*/g, `MENU_IMAGE_URL=${newUrl}`);
  } else {
    envData += `\nMENU_IMAGE_URL=${newUrl}`;
  }
  fs.writeFileSync(configPath, envData);

  // ✅ Update in-memory config (no restart)
  const config = require("../config");
  config.MENU_IMAGE_URL = newUrl;

  // ✅ Confirm message
  await reply(`✅ *Menu image updated successfully!*\n🖼️ *New Image:* ${newUrl}`);

  // ✅ Add emoji react like your other commands
  await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });
});
