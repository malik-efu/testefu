const { cmd } = require('../command');
const config = require("../config");

cmd({
  pattern: "antipromote",
  desc: "Auto demotes both promoter and promoted admins",
  category: "group",
  react: "⚠️",
  filename: __filename
},
async (conn, mek, m, { from, isGroup, isBotAdmins, reply, participants, groupMetadata }) => {
  try {
    if (!isGroup) return reply("❌ This command works only in groups.");
    if (!isBotAdmins) return reply("❌ I need admin rights to manage admins.");

    // Listen for group participant updates
    conn.ev.on('group-participants.update', async (update) => {
      if (!update.action || update.action !== "promote") return;

      const groupId = update.id;
      const promoter = update.author;     // The one who promoted
      const promotedUser = update.participants[0]; // The one who got promoted

      console.log(`⚠️ Admin Promotion detected in ${groupId}`);
      console.log(`Promoter: ${promoter}, Promoted: ${promotedUser}`);

      // Prevent bot from demoting itself
      if (promoter === conn.user.id || promotedUser === conn.user.id) return;

      // Announce action
      await conn.sendMessage(groupId, {
        text: `🚫 *Unauthorized Admin Action Detected!*\n\n@${promoter.split('@')[0]} promoted @${promotedUser.split('@')[0]} to admin.\n\nBoth will now be demoted automatically 😎`,
        mentions: [promoter, promotedUser]
      });

      // Demote both users
      await conn.groupParticipantsUpdate(groupId, [promoter, promotedUser], "demote");

      console.log(`✅ Both users demoted: ${promoter}, ${promotedUser}`);
    });

    reply("✅ Anti Promote system activated. I’ll remove both users if any admin promotes someone.");
  } catch (e) {
    console.error("Anti Promote Error:", e);
    reply("❌ Error while activating Anti Promote feature.");
  }
});
