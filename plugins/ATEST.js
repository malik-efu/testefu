const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "dailymotion",
    alias: ["dm", "dailymo"],
    desc: "Download Dailymotion video by link or search query",
    category: "downloader",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, reply, q, args }) => {
    try {
        if (!q) return reply("🎯 Please provide a Dailymotion video link or search term.\n\nExample:\n.dailymotion https://www.dailymotion.com/video/x9sw09w\n.dailymotion funny cat video");

        // Detect if it's a link or search query
        const isLink = q.includes("dailymotion.com") || q.includes("dai.ly");
        let videoUrl = q.trim();

        // If it's a search term, use Dailymotion search API (simple fetch)
        if (!isLink) {
            reply("🔍 Searching Dailymotion...");
            try {
                const searchRes = await axios.get(`https://api.dailymotion.com/videos?search=${encodeURIComponent(q)}&limit=1`);
                if (searchRes.data && searchRes.data.list && searchRes.data.list.length > 0) {
                    videoUrl = `https://www.dailymotion.com/video/${searchRes.data.list[0].id}`;
                } else {
                    return reply("❌ No results found on Dailymotion.");
                }
            } catch (err) {
                console.error("Search error:", err);
                return reply("⚠️ Search failed. Try using a direct Dailymotion link instead.");
            }
        }

        reply("⏳ Fetching video data...");

        const apiURL = `https://universe-api-mocha.vercel.app/api/dailymotion/download?url=${encodeURIComponent(videoUrl)}`;
        const { data } = await axios.get(apiURL, { timeout: 20000 });

        if (!data.success || !data.data) return reply("❌ Failed to fetch video details.");

        const video = data.data;
        const title = video.title || "Unknown Title";
        const thumbnail = video.thumbnail || null;
        const downloads = video.downloads || [];

        if (!downloads.length) return reply("⚠️ No downloadable links found.");

        // Choose best available quality (prefers 1080p, then lower)
        const qualities = ["2160p", "1440p", "1080p", "720p", "480p", "380p"];
        let best = downloads.find(v => qualities.includes(v.quality)) || downloads[0];

        // Send preview info
        let infoMsg = `🎥 *${title}*\n\n📦 Available Qualities:\n`;
        for (const d of downloads) {
            infoMsg += `• ${d.quality}\n`;
        }
        infoMsg += `\n✅ Sending best quality: *${best.quality}*`;

        if (thumbnail) {
            await conn.sendMessage(from, { image: { url: thumbnail }, caption: infoMsg });
        } else {
            reply(infoMsg);
        }

        // Send video file
        await conn.sendMessage(from, {
            video: { url: best.url },
            caption: `🎬 *${title}*\nQuality: ${best.quality}\n\nDownloaded via: Dailymotion Downloader`,
            mimetype: "video/mp4"
        });

    } catch (e) {
        console.error("Dailymotion Error:", e);
        reply("❌ Error fetching Dailymotion video. Try again later.");
    }
});
