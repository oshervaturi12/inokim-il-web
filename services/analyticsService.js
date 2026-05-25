const Tracker = require('../models/Tracker');
const moment = require('moment-timezone');

exports.getTrackerSummaryForAI = async () => {
  const oneWeekAgo = moment().tz('Asia/Jerusalem').subtract(7, 'days').toDate();

  const trackers = await Tracker.find({ createdAt: { $gte: oneWeekAgo } })
    .sort({ createdAt: -1 })
    .lean();

  const summary = {
    views: 0,
    productViews: 0,
    buttonsClicked: 0,
    timeSpent: 0,
  };

  const referrerStats = {};
  const productStats = {};

  for (const tracker of trackers) {
    const normalizedRef = normalizeReferrer(tracker.referrer);
    referrerStats[normalizedRef] = (referrerStats[normalizedRef] || 0) + 1;

    for (const action of tracker.actions || []) {
      switch (action.type) {
        case 'page_view':
          summary.views++;
          break;

        case 'product_view': {
          summary.productViews++;
          const [slug, inferredSource] = extractProductSlugAndSource(action.pageUrl);

          if (slug) {
            productStats[slug] = (productStats[slug] || 0) + 1;
          }

          if (inferredSource) {
            referrerStats[inferredSource] = (referrerStats[inferredSource] || 0) + 1;
          }

          break;
        }

        case 'button_click':
          summary.buttonsClicked++;
          break;

        case 'time_spent':
          summary.timeSpent += action.timeSpent || 0;
          break;
      }
    }
  }

  const topProducts = Object.entries(productStats)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5) // הגבלה ל-5 מוצרים
  .map(([slug, count]) => `- ${slug} (${count} צפיות)`)
  .join('\n');

  const referrerSummary = Object.entries(referrerStats)
    .sort((a, b) => b[1] - a[1])
    .map(([ref, count]) => `- ${ref}: ${count} כניסות`)
    .join('\n');

  return `
📊 סיכום התנהגות גולשים (שבוע אחרון):
- צפיות בדפים: ${summary.views}
- צפיות במוצרים: ${summary.productViews}
- מוצרים מובילים:
${topProducts || 'אין נתונים'}
- לחיצות על כפתורים: ${summary.buttonsClicked}
- זמן כולל באתר (שניות): ${summary.timeSpent.toFixed(0)}

🧭 מקורות תנועה מובילים:
${referrerSummary || 'אין נתונים'}
`.trim();
};


// Extracts clean hostname from referrer
function normalizeReferrer(ref) {
  if (!ref) return 'ישיר / לא ידוע';
  try {
    const url = new URL(ref);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'ישיר / לא ידוע';
  }
}


// Extract product slug and traffic source from product_view pageUrl
function extractProductSlugAndSource(url) {
  if (!url) return [null, null];
  try {
    const parsed = new URL(url);
    const slug = decodeURIComponent(
      parsed.pathname.split('/products/')[1]?.split('/')[0]?.split('?')[0] || ''
    );

    const params = new URLSearchParams(parsed.search);
    const isGoogle = params.has('gad_source') || params.has('gclid');
    const isFacebook = params.has('fbclid');
    const isTikTok = params.get('utm_source')?.toLowerCase().includes('tiktok');

    const source = isGoogle
      ? 'Google'
      : isFacebook
      ? 'Facebook'
      : isTikTok
      ? 'TikTok'
      : 'Direct / Unknown';

    return [slug || null, source];
  } catch {
    return [null, null];
  }
}
