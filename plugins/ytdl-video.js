const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "ytmp4",
    alias: ["video", "song", "ytv"],
    desc: "Download YouTube videos",
    category: "download",
    react: "🍺",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎥 Please provide a YouTube video name or URL!\n\nExample: `.video sad song`");

        let url = q;
        let videoInfo = null;

        // 🔍 Detect if query is a URL or a title
        if (q.startsWith('http://') || q.startsWith('https://')) {
            if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
                return await reply("❌ Please provide a valid YouTube URL!");
            }
        } else {
            const search = await yts(q);
            if (!search.videos || search.videos.length === 0) {
                return await reply("❌ No video results found!");
            }
            videoInfo = search.videos[0];
            url = videoInfo.url;
        }

        // 📸 Send a loading message
        if (videoInfo) {
            await conn.sendMessage(from, {
                image: { url: videoInfo.thumbnail },
                caption: `🎬 *${videoInfo.title}*\n⏰ *Duration:* ${videoInfo.timestamp}\n👀 *Views:* ${videoInfo.views}\n\n> *📥 Status:* Downloading Please Wait...`
            }, { quoted: mek });
        }

        // 🎬 Use your new API
        const api = `https://universe-api-mocha.vercel.app/api/youtube/download?url=${encodeURIComponent(url)}`;
        const res = await axios.get(api);
        const data = res.data;

        // ✅ Extract correct fields
        const downloadUrl = data?.download || data?.url || data?.result?.download;
        const title = data?.title || videoInfo?.title || "YouTube Video";
        const quality = data?.quality || "360p";

        if (!downloadUrl) {
            console.error("API Response:", data);
            return await reply("❌ No download link found from the API! Please check if the API is returning a 'download' field.");
        }

        // 🧾 Send the video
        await conn.sendMessage(from, {
            video: { url: downloadUrl },
            caption: `🎬 *${title}*\n📥 *Quality:* ${quality}\n\n> *✅ Download Completed!*\n\n> *DARKZONE-MD*`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("❌ Error in .ytmp4:", e);
        await reply("⚠️ Something went wrong! Try again later.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
