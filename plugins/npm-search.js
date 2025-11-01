const axios = require("axios");
const { cmd } = require('../command');

cmd({
  pattern: "sas",
  alias: ["ssweb", "screenshot"],
  react: "💫",
  desc: "Capture and download a screenshot of a website.",
  category: "tools",
  use: ".sss <link>",
  filename: __filename,
}, 
async (conn, mek, m, {
  from, q, reply
}) => {
  if (!q) return reply("🌐 Please provide a valid website link.\nExample: *.sss https://google.com*");

  try {
    reply("⏳ Capturing screenshot, please wait...");

    // 🧠 API Request
    const apiURL = `https://api.davidcyriltech.my.id/ssweb?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiURL);

    // ✅ Adjusted for correct response structure
    const screenshotUrl = data?.result || data?.image || data?.url;

    if (!screenshotUrl) {
      console.error("❌ Unexpected API response:", data);
      return reply("⚠️ Failed to fetch screenshot. API returned empty data.");
    }

    // 📤 Send screenshot
    await conn.sendMessage(from, {
      image: { url: screenshotUrl },
      caption: `✅ *Screenshot Captured Successfully!*\n\n🌍 *URL:* ${q}\n📸 *API by:* Jawad Tech`
    }, { quoted: m });

  } catch (error) {
    console.error("❌ Screenshot Error:", error);
    reply("🚫 Failed to capture screenshot. Please try again later.");
  }
});
