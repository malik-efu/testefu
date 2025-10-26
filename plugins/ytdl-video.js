const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "ytmp4",
    alias: ["video", "song", "ytv"],
    desc: "Download YouTube videos",
    category: "download",
    react: "📹",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎥 Please provide a YouTube video name or URL!\n\nExample: `.video sad song`");

        let url = q;
        let videoInfo = null;

        // 🔍 Check if query is a URL or title
        if (q.startsWith('http://') || q.startsWith('https://')) {
            if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
                return await reply("❌ Please provide a valid YouTube URL!");
            }
            const videoId = getVideoId(q);
            if (!videoId) return await reply("❌ Invalid YouTube URL!");
            
            const searchFromUrl = await yts({ videoId: videoId });
            videoInfo = searchFromUrl;
        } else {
            const search = await yts(q);
            if (!search.videos || search.videos.length === 0) {
                return await reply("❌ No video results found!");
            }
            videoInfo = search.videos[0];
            url = videoInfo.url;
        }

        // Helper function to extract video ID from URL
        function getVideoId(url) {
            const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            return match ? match[1] : null;
        }

        // 📸 Send thumbnail with title and downloading status
        if (videoInfo) {
            await conn.sendMessage(from, {
                image: { url: videoInfo.thumbnail },
                caption: `🎬 *${videoInfo.title}*\n⏰ *Duration:* ${videoInfo.timestamp}\n👀 *Views:* ${videoInfo.views}\n\n> *📥 Status: Downloading Please Wait...*`
            }, { quoted: mek });
        }

        // 🎬 Fetch video from NEW API
        const api = `https://universe-api-mocha.vercel.app/api/youtube/download?url=${encodeURIComponent(url)}`;
        const res = await axios.get(api);
        const data = res.data;

        // ✅ Adjust according to your API response
        const downloadUrl = data?.url || data?.download_url || data?.result?.url;
        const title = data?.title || videoInfo?.title || "YouTube Video";
        const quality = data?.quality || "360p";
        const duration = data?.duration || videoInfo?.duration?.seconds || "N/A";

        if (!downloadUrl) return await reply("❌ No download link found from the API!");

        // 🧾 Send the video
        await conn.sendMessage(from, {
            video: { url: downloadUrl },
            caption: `🎬 *${title}*\n📥 *Quality:* ${quality}\n🕒 *Duration:* ${duration}\n\n> *✅ Download Completed!*\n\n> *DARKZONE-MD*`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("❌ Error in .ytmp4:", e);
        await reply("⚠️ Something went wrong! Try again later.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
