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

const ppUrls = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

// 🌟 Added: Text bars & fun lines
const bars = [
    "🍺━━━━━━━━━━━━━━━🍺",
    "🌈━━━━━━━━━━━━━━━🌈",
    "💫━━━━━━━━━━━━━━━💫",
    "🎉━━━━━━━━━━━━━━━🎉",
];

const funLines = [
    "✨ Enjoy your stay and spread good vibes!",
    "🌟 Be active, be kind, and make friends!",
    "🎈 New energy unlocked in the group!",
    "🔥 Let’s make some awesome memories together!",
    "💬 Don’t forget to say hi and join the chat!",
];

const goodbyeLines = [
    "💔 Another soul leaves our chat... you’ll be missed!",
    "😭 Goodbye friend, the group won’t be the same without you!",
    "🌹 Farewell! Hope life treats you kindly!",
    "👋 You’re leaving us, but memories stay forever!",
    "😢 One chapter closes, another begins. Take care!",
];

const GroupEvents = async (conn, update) => {
    try {
        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants.length;

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString();

            // 🌟 Always fetch user photo (not group)
            let userPp;
            try {
                userPp = await conn.profilePictureUrl(num, 'image');
            } catch {
                userPp = ppUrls[Math.floor(Math.random() * ppUrls.length)];
            }

            if (update.action === "add" && config.WELCOME === "true") {
                const randomBar = bars[Math.floor(Math.random() * bars.length)];
                const randomLine = funLines[Math.floor(Math.random() * funLines.length)];

                const WelcomeText = `${randomBar}\n` +
                    `👋 Hey @${userName}!\n` +
                    `${randomBar}\n` +
                    `Welcome to *${metadata.subject}* 🎉\n` +
                    `👥 Member count: *${groupMembersCount}*\n` +
                    `🕒 Joined: *${timestamp}*\n\n` +
                    `${randomLine}\n` +
                    `${randomBar}\n` +
                    `💎 *Powered by ${config.BOT_NAME}* 💎`;

                await conn.sendMessage(update.id, {
                    image: { url: userPp },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "remove" && config.WELCOME === "true") {
                const randomBar = bars[Math.floor(Math.random() * bars.length)];
                const randomGoodbye = goodbyeLines[Math.floor(Math.random() * goodbyeLines.length)];

                const GoodbyeText = `${randomBar}\n` +
                    `😢 @${userName} just left the group...\n` +
                    `${randomBar}\n` +
                    `${randomGoodbye}\n\n` +
                    `🕒 Left: *${timestamp}*\n` +
                    `👥 Members left: *${groupMembersCount}*\n` +
                    `${randomBar}\n` +
                    `💫 *${config.BOT_NAME} wishes you all the best!* 💫`;

                await conn.sendMessage(update.id, {
                    image: { url: userPp },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                const demoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `*Admin Event*\n\n` +
                        `@${demoter} has demoted @${userName} from admin. 👀\n` +
                        `Time: ${timestamp}\n` +
                        `*Group:* ${metadata.subject}`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });

            } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                const promoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `*Admin Event*\n\n` +
                        `@${promoter} has promoted @${userName} to admin. 🎉\n` +
                        `Time: ${timestamp}\n` +
                        `*Group:* ${metadata.subject}`,
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
