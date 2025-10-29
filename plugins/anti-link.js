const { cmd } = require('../command');
const config = require("../config");

cmd({
  on: "body"
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    // Only act in groups where bot is admin and sender isn't admin
    if (!isGroup || isAdmins || !isBotAdmins) return;

    // 🔥 Universal link detection regex (matches any domain or link)
    const universalLinkRegex = /\b((https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,})(\/\S*)?/gi;

    // ✅ Detect group invite links (WhatsApp group)
    const waGroupRegex = /chat\.whatsapp\.com\/[A-Za-z0-9]+/gi;

    // Check if message contains any type of link or domain
    const containsLink = universalLinkRegex.test(body) || waGroupRegex.test(body);

    // Proceed only if anti-link is enabled
    if (containsLink && config.ANTI_LINK === 'true') {
      console.log(`🚫 Link detected from ${sender}: ${body}`);

      // 🗑 Try to delete the message
      try {
        await conn.sendMessage(from, { delete: m.key });
        console.log(`✅ Message deleted: ${m.key.id}`);
      } catch (error) {
        console.error("❌ Failed to delete message:", error);
      }

      // ⚠️ Notify and kick user
      await conn.sendMessage(from, {
        text: `🚨 *LINK DETECTED!* 🚨\n\n@${sender.split('@')[0]} sent a forbidden link!\n\n🔒 Links are not allowed in this group.`,
        mentions: [sender]
      });

      await conn.groupParticipantsUpdate(from, [sender], "remove");

      console.log(`👢 User removed: ${sender}`);
    }
  } catch (error) {
    console.error("Anti-link error:", error);
    reply("❌ An error occurred while processing anti-link.");
  }
});
