const fetch = require('node-fetch');
const { cmd } = require('../command');

cmd({
    pattern: "ss1",
    alias: ["ssweb", "screenshot"],
    desc: "Take a screenshot of any website",
    react: "📸",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        // Show usage if no URL provided
        if (!q) {
            return reply(
                `*🖼️ SCREENSHOT TOOL*\n\n` +
                `Usage:\n` +
                `> .ss <url>\n` +
                `> .ssweb <url>\n` +
                `> .screenshot <url>\n\n` +
                `Example:\n` +
                `.ss https://google.com\n` +
                `.ssweb https://github.com`
            );
        }

        const url = q.trim();

        // Validate URL format
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return reply('❌ Please provide a valid URL starting with http:// or https://');
        }

        await reply('⏳ Taking screenshot, please wait...');

        // Call Screenshot API
        const apiUrl = `https://api.siputzx.my.id/api/tools/ssweb?url=${encodeURIComponent(url)}&theme=light&device=desktop`;
        const response = await fetch(apiUrl, { headers: { 'accept': '*/*' } });

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }

        const imageBuffer = await response.buffer();

        // Send Screenshot Image
        await conn.sendMessage(from, { 
            image: imageBuffer, 
            caption: `✅ Screenshot of: ${url}\n\nPowered by: *${conn.user.name || "Your Bot"}*`
        }, { quoted: mek });

    } catch (error) {
        console.error('Screenshot command error:', error);
        await reply(
            '❌ Failed to take screenshot.\n\nPossible issues:\n' +
            '• Invalid or unreachable URL\n' +
            '• Website blocked screenshots\n' +
            '• API service may be temporarily down'
        );
    }
});
