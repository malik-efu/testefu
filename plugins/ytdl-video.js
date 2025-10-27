const axios = require('axios');
const cheerio = require('cheerio');

cmd({
    pattern: "download1",
    desc: "Search for movie download links",
    category: "utility",
    react: "📥",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, args }) => {
    try {
        const query = args.join(' ');
        if (!query) {
            return reply("Please provide movie/show name\nExample: .download movie name");
        }

        // Basic web scraping example structure
        const searchUrl = `https://subzerocinema.gleeze.com/search?q=${encodeURIComponent(query)}`;
        
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        
        // This is where you'd parse the HTML structure
        // Note: Actual selectors would need to be determined by inspecting the website
        
        let downloadLinks = [];
        
        // Example parsing (you'll need to adjust based on actual HTML structure)
        $('.download-link').each((i, elem) => {
            const quality = $(elem).find('.quality').text();
            const link = $(elem).attr('href');
            if (quality.includes('480')) {
                downloadLinks.push({ quality, link });
            }
        });

        if (downloadLinks.length === 0) {
            return reply(`No 480p download links found for "${query}"`);
        }

        let message = `📥 Download Links for "${query}"\n\n`;
        downloadLinks.forEach((item, index) => {
            message += `${index + 1}. ${item.quality}\n${item.link}\n\n`;
        });

        await reply(message);

    } catch (error) {
        console.error('Download command error:', error);
        reply(`Error: ${error.message}`);
    }
});
