const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Clean unnecessary elements and attributes from raw HTML.
 * @param {string} rawHtml
 * @returns {string}
 */
function cleanHtml(rawHtml) {
  const $ = cheerio.load(rawHtml);

  // Remove unwanted elements
  $('svg, script, style, noscript, iframe, canvas, link, meta, img, video, audio, source').remove();

  // Optionally remove classes and inline styles
  $('[class]').removeAttr('class');
  $('[style]').removeAttr('style');

  // Remove empty elements
  $('*').each(function () {
    if (!$(this).text().trim() && $(this).children().length === 0) {
      $(this).remove();
    }
  });

  return $.html();
}

/**
 * Fetch and clean HTML from a URL.
 * @param {string} url - Full URL to fetch.
 * @returns {Promise<{ html: string, $: cheerio.Root }>}
 */
async function fetchHtml(url) {
  try {
    const { data: rawHtml } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (AI Bot)',
        'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 10000
    });

    const cleaned = cleanHtml(rawHtml);
    const $ = cheerio.load(cleaned);

    return { html: cleaned, $ };
  } catch (err) {
    console.error(`❌ Failed to fetch HTML from ${url}`, err.message);
    return { html: '', $: cheerio.load('') };
  }
}

module.exports = fetchHtml;
