const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "ytmp4",
    alias: ["video", "song", "ytv"],
    desc: "Download YouTube or TikTok videos",
    category: "download",
    react: "📹",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎥 Please provide a video name or URL!\n\nExample: `.video sad song`");

        let url = q.trim();
        let videoInfo = null;

        // 📍 Detect platform
        const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
        const isTikTok = url.includes("tiktok.com");

        // 🎬 Handle YouTube Search
        if (!isYouTube && !isTikTok) {
            const search = await yts(q);
            if (!search.videos || search.videos.length === 0) {
                return await reply("❌ No video results found!");
            }
            videoInfo = search.videos[0];
            url = videoInfo.url;
        }

        // 🖼️ Send info preview
        if (videoInfo) {
            await conn.sendMessage(from, {
                image: { url: videoInfo.thumbnail },
                caption: `🎬 *${videoInfo.title}*\n⏰ *Duration:* ${videoInfo.timestamp}\n👀 *Views:* ${videoInfo.views}\n\n> *📥 Downloading, please wait...*`
            }, { quoted: mek });
        }

        let api, res, data, downloadUrl, title;

        // ✅ Choose API depending on platform
        if (isTikTok) {
            api = `https://universe-api-mocha.vercel.app/api/tiktok/download?url=${encodeURIComponent(url)}`;
            res = await axios.get(api);
            data = res.data;
            if (!data?.result?.video) return await reply("❌ TikTok download failed!");
            downloadUrl = data.result.video;
            title = data.result.title || "TikTok Video";
        } else {
            api = `https://api.akuari.my.id/downloader/youtube?link=${encodeURIComponent(url)}`;
            res = await axios.get(api);
            data = res.data;
            if (!data?.mp4?.link) return await reply("❌ YouTube download failed!");
            downloadUrl = data.mp4.link;
            title = data.title || videoInfo?.title || "YouTube Video";
        }

        // 🎥 Send video
        await conn.sendMessage(from, {
            video: { url: downloadUrl },
            caption: `🎬 *${title}*\n\n> ✅ *Download Complete!*`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("❌ Error in .ytmp4:", e);
        await reply("⚠️ Something went wrong while downloading. Please check the URL or try again later.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
