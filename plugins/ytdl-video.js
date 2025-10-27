const { cmd, commands } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');

// ✅ Define config.env path properly
const configPath = path.join(__dirname, "../config.env");

cmd({
  pattern: "setmenuimg",
  alias: ["botdp", "setmenu"],
  desc: "Change the bot menu image URL.",
  category: "settings",
  filename: __filename,
}, async (conn, mek, m, { args, isOwner, reply }) => {

  // ✅ Owner check
  if (!isOwner) return reply("🚫 *Only owner can use this command!*");

  // ✅ Argument check
  if (!args[0]) return reply("❌ *Please provide a new image URL.*\n\nExample:\n.setmenuimg https://files.catbox.moe/abcd12.jpg");

  const newUrl = args[0].trim();

  // ✅ Optional URL validation
  if (!/^https?:\/\//i.test(newUrl)) return reply("⚠️ *Invalid URL!*\nPlease provide a valid https:// link.");

  try {
    // ✅ Read and update config.env safely
    let envData = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf-8") : "";
    if (envData.includes("MENU_IMAGE_URL=")) {
      envData = envData.replace(/MENU_IMAGE_URL=.*/g, `MENU_IMAGE_URL=${newUrl}`);
    } else {
      envData += `\nMENU_IMAGE_URL=${newUrl}`;
    }
    fs.writeFileSync(configPath, envData);

    // ✅ Update running config instantly (no restart)
    config.MENU_IMAGE_URL = newUrl;

    // ✅ Confirmation message
    await reply(`✅ *Menu image updated successfully!*\n🖼️ *New Image:* ${newUrl}`);

    // ✅ React emoji feedback
    await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });
  } catch (err) {
    console.error("Error updating menu image:", err);
    return reply("❌ *An error occurred while updating the menu image.*");
  }
});
