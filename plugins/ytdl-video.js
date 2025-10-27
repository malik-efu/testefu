const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "ytdl",
    alias: ["yt", "ytvideo", "ytmusic"],
    desc: "Download YouTube videos or audios using JawadTech API",
    category: "download",
    react: "🎧",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎬 Please provide a YouTube video name or URL!\n\nExample: `.ytdl Alan Walker - Faded`");

        let url = q;
        let videoInfo = null;

        // Check if query is a valid YouTube URL or search keyword
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
                return await reply("❌ No results found!");
            }
            videoInfo = search.videos[0];
            url = videoInfo.url;
        }

        // Helper: extract video ID
        function getVideoId(url) {
            const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            return match ? match[1] : null;
        }

        // Send video info first
        await conn.sendMessage(from, {
            image: { url: videoInfo.thumbnail },
            caption: `🎬 *${videoInfo.title}*\n⏰ *Duration:* ${videoInfo.timestamp}\n👁️ *Views:* ${videoInfo.views}\n\n> ⏳ *Downloading, please wait...*`
        }, { quoted: mek });

        // Call your API
        const api = `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(url)}`;
        const res = await axios.get(api);
        const data = res.data;

        // Check API response
        if (!data?.status || !data?.result) {
            return await reply("❌ Failed to fetch from API! Please try again.");
        }

        const { title, mp3, mp4 } = data.result;

        // Send both audio & video buttons
        const buttons = [
            { buttonId: `.ytdlmp3 ${url}`, buttonText: { displayText: "🎵 MP3 Audio" }, type: 1 },
            { buttonId: `.ytdlmp4 ${url}`, buttonText: { displayText: "🎥 MP4 Video" }, type: 1 }
        ];

        await conn.sendMessage(from, {
            image: { url: videoInfo.thumbnail },
            caption: `🎬 *${title}*\n\nChoose format to download:`,
            buttons,
            headerType: 4
        }, { quoted: mek });

    } catch (err) {
        console.error("❌ Error in .ytdl command:", err);
        await reply("⚠️ Something went wrong! Try again later.");
    }
});

// 🎵 MP3 downloader command
cmd({
    pattern: "ytdlmp3",
    desc: "Download YouTube audio via JawadTech API",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎧 Please provide a YouTube URL!");
        const api = `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(q)}`;
        const res = await axios.get(api);
        const data = res.data;

        if (!data?.status) return await reply("❌ API error!");
        const { title, mp3 } = data.result;

        await conn.sendMessage(from, {
            audio: { url: mp3 },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            caption: `🎶 *${title}*\n\n✅ Downloaded successfully!`
        }, { quoted: mek });

    } catch (err) {
        console.error("❌ Error in .ytdlmp3:", err);
        await reply("⚠️ Failed to download audio!");
    }
});

// 🎥 MP4 downloader command
cmd({
    pattern: "video",
    desc: "Download YouTube video via JawadTech API",
    category: "download",
    react: "🎥",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎬 Please provide a YouTube URL!");
        const api = `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(q)}`;
        const res = await axios.get(api);
        const data = res.data;

        if (!data?.status) return await reply("❌ API error!");
        const { title, mp4 } = data.result;

        await conn.sendMessage(from, {
            video: { url: mp4 },
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption: `🎬 *${title}*\n\n✅ Downloaded successfully!`
        }, { quoted: mek });

    } catch (err) {
        console.error("❌ Error in .ytdlmp4:", err);
        await reply("⚠️ Failed to download video!");
    }
});
