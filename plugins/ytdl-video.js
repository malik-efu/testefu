const { cmd, commands } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, "../config.env");

cmd({
  pattern: "setprefix",
  alias: ["prefix"],
  desc: "Change the bot command prefix.",
  category: "settings",
  filename: __filename,
}, async (conn, mek, m, { args, isOwner, reply }) => {
  try {
    if (!isOwner) return reply("🚫 *Only owner can use this command!*");
    if (!args[0]) return reply("❌ *Please provide a new prefix.*\n\nExample:\n.setprefix !");

    const newPrefix = args[0].trim();

    // ✅ Update config.env (persistent)
    let envData = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf-8") : "";
    if (envData.includes("PREFIX=")) {
      envData = envData.replace(/PREFIX=.*/g, `PREFIX=${newPrefix}`);
    } else {
      envData += `\nPREFIX=${newPrefix}`;
    }
    fs.writeFileSync(configPath, envData);

    // ✅ Update runtime config instantly
    config.PREFIX = newPrefix;
    global.prefix = newPrefix; // make it live immediately
    global.PREFIX = newPrefix; // for safety in case handler uses uppercase

    // ✅ Confirmation message
    await reply(`✅ *Prefix successfully changed to:* \`${newPrefix}\``);
    await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

  } catch (err) {
    console.error("❌ setprefix error:", err);
    await reply("⚠️ *An error occurred while updating the prefix.*");
  }
});
