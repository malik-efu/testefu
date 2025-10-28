const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363416743041101@newsletter',
            newsletterName: '𝐸𝑅𝐹𝒜𝒩 𝒜𝐻𝑀𝒜𝒟',
            serverMessageId: 143,
        },
    };
};

const fancyBar = "🍺━━━━━━━━━━━━━━━━━━━🍺";

const GroupEvents = async (conn, update) => {
    try {
        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const groupMembersCount = metadata.participants.length;
        const groupName = metadata.subject;

        let groupDp;
        try {
            groupDp = await conn.profilePictureUrl(update.id, 'image');
        } catch {
            groupDp = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
        }

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString();
            let userDp;

            try {
                userDp = await conn.profilePictureUrl(num, 'image');
            } catch {
                userDp = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
            }

            // ✨ WELCOME EVENT
            if (update.action === "add" && config.WELCOME === "true") {
                const WelcomeText = `
${fancyBar}
*🌟 WELCOME NEW MEMBER 🌟*
${fancyBar}

Hey @${userName} 👋  
Welcome to *${groupName}*! 🎉  

🧍 Member Count: *${groupMembersCount}*  
🕒 Joined: *${timestamp}*  

Enjoy your stay and be respectful 💫  
${fancyBar}
*Powered by ${config.BOT_NAME}*
`;

                await conn.sendMessage(update.id, {
                    image: { url: userDp },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            // 👋 GOODBYE EVENT
            } else if (update.action === "remove" && config.WELCOME === "true") {
                const GoodbyeText = `
${fancyBar}
*😢 MEMBER LEFT 😢*
${fancyBar}

Goodbye @${userName}!  
We’ll miss you 💔  

🕒 Left at: *${timestamp}*  
👥 Members left: *${groupMembersCount}*

${fancyBar}
*${config.BOT_NAME} says take care!*`;

                await conn.sendMessage(update.id, {
                    image: { url: groupDp },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            // ⚙️ DEMOTE EVENT
            } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                const demoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `${fancyBar}\n*ADMIN EVENT*\n${fancyBar}\n\n@${demoter} has demoted @${userName} from admin 😢\n🕒 *${timestamp}*\n*Group:* ${groupName}`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });

            // ⚙️ PROMOTE EVENT
            } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                const promoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `${fancyBar}\n*ADMIN EVENT*\n${fancyBar}\n\n@${promoter} has promoted @${userName} to admin 🎉\n🕒 *${timestamp}*\n*Group:* ${groupName}`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
