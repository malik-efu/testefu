const { cmd } = require('../command');
const config = require("../config");

cmd({
  pattern: "antipromote",
  desc: "Automatically demotes both promoter and promoted admins (except bot or owner).",
  category: "security",
  react: "🚫",
  filename: __filename
},
async (conn, mek, m, { from, isGroup, isBotAdmins, senderNumber, reply }) => {
  try {
    if (!isGroup) return reply("❌ This command works only in groups.");
    if (!isBotAdmins) return reply("❌ I need admin rights to manage admins.");

    const botOwner = config.OWNER_NUMBER?.replace(/[^0-9]/g, '');
    const groupMetadata = await conn.groupMetadata(from);
    const groupOwner = groupMetadata.owner?.split('@')[0];

    // Allow only group owner or bot owner to activate
    if (senderNumber !== botOwner && senderNumber !== groupOwner) {
      return reply("❌ Only the group owner or bot owner can activate Anti Promote.");
    }

    // Anti Promote activated
    reply("✅ *Anti Promote system activated!*\nIf any admin promotes another member, both will be demoted automatically (except bot or owners).");

    // Listen for promotion events
    conn.ev.on('group-participants.update', async (update) => {
      if (!update || update.action !== "promote") return;

      const groupId = update.id;
      const promoter = update.author; // The admin who promoted
      const promotedUser = update.participants[0]; // The new admin

      // Get bot number
      const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";

      // Ignore if the bot itself is the promoter
      if (promoter === botNumber) return;

      // Ignore if the bot is the one promoted
      if (promotedUser === botNumber) return;

      // Ignore if the promoter is the bot owner or group owner
      if (
        promoter.includes(botOwner) ||
        promoter.includes(groupOwner)
      ) return;

      console.log(`🚫 Anti Promote Triggered in ${groupId}`);
      console.log(`Promoter: ${promoter}, Promoted: ${promotedUser}`);

      // Notify group
      await conn.sendMessage(groupId, {
        text: `🚫 *Unauthorized Admin Action Detected!* 🚫\n\n@${promoter.split('@')[0]} tried to promote @${promotedUser.split('@')[0]}.\n\nBoth have been demoted automatically.`,
        mentions: [promoter, promotedUser]
      });

      // Demote both users
      await conn.groupParticipantsUpdate(groupId, [promoter, promotedUser], "demote");
      console.log(`✅ Demoted both: ${promoter}, ${promotedUser}`);
    });

  } catch (e) {
    console.error("Anti Promote Error:", e);
    reply("❌ Error while activating Anti Promote feature.");
  }
});
