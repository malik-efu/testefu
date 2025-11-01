const { cmd } = require('../command');
const { sleep } = require('../lib/functions');

// =============== Set My Profile Picture ===============
cmd({
    pattern: "setpp",
    desc: "Set your WhatsApp profile picture",
    category: "user",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { quoted, reply, mime }) => {
    try {
        if (!quoted || !/image/.test(mime)) return reply("📸 Please reply to an image to set as your profile picture.");
        let img = await quoted.download();
        await conn.updateProfilePicture(conn.user.id, img);
        reply("✅ Successfully updated your profile picture!");
    } catch (e) {
        console.error(e);
        reply("❌ Failed to set profile picture. Make sure the image is valid.");
    }
});

// =============== Set Group Profile Picture ===============
cmd({
    pattern: "setgpp",
    desc: "Set the group display picture",
    category: "group",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, quoted, reply, mime, sender, isAdmin }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmin) return reply("⚠️ Only group admins can use this command.");
        if (!quoted || !/image/.test(mime)) return reply("📸 Please reply to an image to set as group profile picture.");
        let img = await quoted.download();
        await conn.updateProfilePicture(from, img);
        reply("✅ Group profile picture updated successfully!");
    } catch (e) {
        console.error(e);
        reply("❌ Failed to update group profile picture.");
    }
});

// =============== Get Bio Command ===============
cmd({
    pattern: "getbio",
    desc: "Get the bio (About) of a mentioned or replied user",
    category: "info",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { reply, mentionByTag, reply_user }) => {
    try {
        let target = mentionByTag && mentionByTag[0]
            ? mentionByTag[0]
            : reply_user
                ? reply_user
                : m.sender;

        let bio = await conn.fetchStatus(target);
        reply(`🧾 *Bio of @${target.split('@')[0]}:*\n\n${bio?.status || "No bio set."}`, { mentions: [target] });
    } catch (e) {
        console.error(e);
        reply("❌ Couldn't fetch bio. The user might have hidden their 'About' info.");
    }
});
