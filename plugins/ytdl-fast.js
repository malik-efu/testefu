const { fetchJson } = require("../lib/functions");
const { downloadTiktok } = require("@mrnima/tiktok-downloader");
const { facebook } = require("@mrnima/facebook-downloader");
const cheerio = require("cheerio");
const { igdl } = require("ruhend-scraper");
const axios = require("axios");
const { cmd, commands } = require('../command');

// twitter-dl

cmd({
  pattern: "twitte",
  alias: ["tweet", "twdl"],
  desc: "Download Twitter videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, {
  from,
  quoted,
  q,
  reply
}) => {
  try {
    if (!q || !/(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\//i.test(q)) {
  return conn.sendMessage(from, { text: "❌ Please provide a valid Twitter or X URL." }, { quoted: m });
}


    await conn.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    });

    // 🔹 Updated API URL
    const response = await axios.get(`https://universe-api-mocha.vercel.app/api/twitter/download?url=${q}`);
    const data = response.data;

    if (!data || !data.result || !data.result.media) {
      return reply("⚠️ Failed to retrieve Twitter video. Please check the link and try again.");
    }

    // Adjusting to possible response structure from new API
    const videoData = data.result.media[0] || {};
    const videoUrl = videoData.url || null;
    const thumb = data.result.thumbnail || null;
    const desc = data.result.title || "No description available";

    if (!videoUrl) {
      return reply("⚠️ Couldn't find any downloadable video in the provided link.");
    }

    const caption = `╭━━━〔 *TWITTER DOWNLOADER* 〕━━━⊷\n`
      + `┃▸ *Description:* ${desc}\n`
      + `╰━━━⪼\n\n`
      + `📹 *Download Options:*\n`
      + `1️⃣  *Video*\n`
      + `2️⃣  *Audio*\n`
      + `3️⃣  *Document*\n`
      + `4️⃣  *Voice*\n\n`
      + `📌 *Reply with the number to download your choice.*`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumb },
      caption: caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        await conn.sendMessage(senderID, {
          react: { text: '⬇️', key: receivedMsg.key }
        });

        switch (receivedText) {
          case "1":
            await conn.sendMessage(senderID, {
              video: { url: videoUrl },
              caption: "📥 *Downloaded Video Successfully!*"
            }, { quoted: receivedMsg });
            break;

          case "2":
            await conn.sendMessage(senderID, {
              audio: { url: videoUrl },
              mimetype: "audio/mpeg"
            }, { quoted: receivedMsg });
            break;

          case "3":
            await conn.sendMessage(senderID, {
              document: { url: videoUrl },
              mimetype: "audio/mpeg",
              fileName: "Twitter_Audio.mp3",
              caption: "📥 *Audio Downloaded as Document*"
            }, { quoted: receivedMsg });
            break;

          case "4":
            await conn.sendMessage(senderID, {
              audio: { url: videoUrl },
              mimetype: "audio/mp4",
              ptt: true
            }, { quoted: receivedMsg });
            break;

          default:
            reply("❌ Invalid option! Please reply with 1, 2, 3, or 4.");
        }
      }
    });

  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});
