const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../config.env");

cmd({
  pattern: "setprefix",
  alias: ["prefix"],
  desc: "Change bot prefix.",
  category: "settings",
  filename: __filename,
}, async (conn, mek, m, { args, isOwner, reply }) => {
  if (!isOwner) return reply("🚫 *Only owner can use this command!*");
  if (!args[0]) return reply("❌ *Please provide a new prefix.*\n\nExample: .setprefix !");

  const newPrefix = args[0].trim();

  // ✅ Update config.env file safely
  let envData = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf-8") : "";
  if (envData.includes("PREFIX=")) {
    envData = envData.replace(/PREFIX=.*/g, `PREFIX=${newPrefix}`);
  } else {
    envData += `\nPREFIX=${newPrefix}`;
  }
  fs.writeFileSync(configPath, envData);

  // ✅ Update in-memory prefix instantly (no restart)
  const config = require("../config");
  config.PREFIX = newPrefix;

  // ✅ Respond like your normal commands
  await reply(`✅ *Prefix successfully changed to:* \`${newPrefix}\``);
  await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });
});

