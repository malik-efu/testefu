const fetch = require('node-fetch');
const { cmd } = require('../command');

cmd({
    pattern: "sas",
    alias: ["ssweb", "screenshot"],
    desc: "Take a live screenshot of any website",
    react: "📸",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply(
                `*🌐 SCREENSHOT TOOL*\n\n` +
                `Usage:\n` +
                `.ss <url>\n.ssweb <url>\n.screenshot <url>\n\n` +
                `Example:\n.ss https://google.com`
            );
        }

        const url = q.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return reply('❌ Please provide a valid URL starting with http:// or https://');
        }

        await reply('⏳ Capturing screenshot, please wait...');

        // WORKING API
        const apiUrl = `https://imageapi.xyz/api/screenshot?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }

        const imageBuffer = await response.buffer();

        await conn.sendMessage(from, {
            image: imageBuffer,
            caption: `✅ Screenshot captured successfully!\n🌍 URL: ${url}`
        }, { quoted: mek });

    } catch (error) {
        console.error('Screenshot command error:', error);
        await reply('❌ Failed to capture screenshot. Please try again later.');
    }
});
