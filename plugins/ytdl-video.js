const axios = require('axios');
const cheerio = require('cheerio');
const { cmd } = require('../command');

cmd({
    pattern: "movie1",
    desc: "Fetch download link for a movie or series (480p)",
    category: "utility",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, args }) => {
    try {
        const query = args.length > 0 ? args.join(' ') : m.text.replace(/^[\.\#\$\!]?movie\s?/i, '').trim();
        if (!query) return reply("🎥 Please type a movie or series name.\nExample: .movie Spider Man No Way Home");

        reply(`🔍 Searching "${query}"...`);

        // Step 1: Search on the website
        const searchUrl = `https://subzerocinema.gleeze.com/?s=${encodeURIComponent(query)}`;
        const searchRes = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(searchRes.data);

        // Step 2: Get the first search result
        const firstLink = $('h2.entry-title a').first().attr('href');
        if (!firstLink) return reply("❌ No results found. Try another name.");

        // Step 3: Visit the movie page
        const pageRes = await axios.get(firstLink, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $$ = cheerio.load(pageRes.data);

        // Step 4: Try to find 480p download links
        let downloadLink;
        $$('a').each((i, el) => {
            const text = $$(el).text().toLowerCase();
            if (text.includes('480p') || text.includes('sd')) {
                downloadLink = $$(el).attr('href');
                return false; // break loop
            }
        });

        if (!downloadLink) {
            return reply("⚠️ 480p link not found. Try manually checking the page.");
        }

        // Step 5: Send formatted message
        const title = $$('h1.entry-title').text().trim() || query;

        const msg = `
🎬 *${title}*
📥 *Download (480p):* [Click Here](${downloadLink})

➡️ Tap to start download automatically.
`;

        await conn.sendMessage(from, { text: msg }, { quoted: mek });

    } catch (e) {
        console.error("Error scraping movie:", e);
        reply("❌ Something went wrong while fetching the movie link.");
    }
});
