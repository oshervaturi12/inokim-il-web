const ABTest = require('../models/ABTests');
const AIInsight = require('../models/AIInsight');
const { generateInsight } = require('../services/openAIService');
const { getTrackerSummaryForAI } = require('../services/analyticsService');
const moment = require('moment-timezone');

class DailyABTestInsightJob {
  static async run() {
    console.log('🚀 Running DailyABTestInsightJob...');
    const tests = await ABTest.find({ isActive: true });

    const trackerSummary = await getTrackerSummaryForAI(); // 📊 global summary once per run

    for (const test of tests) {
      const abSummary = formatAnalyticsForAI(test);

      const description = test.description
      ? `📝 תיאור המבחן: ${test.description}\n\n`
      : '';


      const prompts = {
        ab_test: `הנתונים הבאים מציגים את ביצועי מבחן A/B כולל תוכן כל וריאנט:
        ${abSummary} 
        נתח את ההבדלים בין הגרסאות, והמלץ איזו גרסה עדיפה ולמה.`,
        tracker: `בהתבסס על סיכום התנהגות הגולשים באתר, הצע שיפורי UX או CRO שיכולים לשפר את יחס ההמרה או חוויית המשתמש:\n\n${trackerSummary}`,
        combined: `
        ${description}
        בהתבסס על סיכום התנהגות גולשים וביצועי מבחן A/B, נתח איזו גרסה עדיפה ומה ניתן לשפר:
        
        📊 ביצועי A/B:
        ${abSummary}
        
        🧭 סיכום התנהגות גולשים:
        ${trackerSummary}
        `.trim()
      };

      for (const [source, prompt] of Object.entries(prompts)) {
        try {
          const response = await generateInsight(prompt);

          await AIInsight.findOneAndUpdate(
            { test: test._id, source },
            {
              test: test._id,
              type: "text_section",
              key: test.key,
              source,
              title: `תובנה מסוג ${source}`,
              prompt,
              response,
              model: 'gpt-4o',
              metadata: {
                runAt: moment().tz('Asia/Jerusalem').format(),
              }
            },
            { upsert: true, new: true }
          );

          console.log(`✅ Saved insight [${source}] for ${test.key}`);
        } catch (err) {
          console.warn(`❌ Insight generation failed for ${test.key} (${source}):`, err.message);
        }
      }
    }

    console.log('🏁 DailyABTestInsightJob completed.');
  }
}
function formatAnalyticsForAI(test) {
  const description = test.description
    ? `📝 תיאור המבחן: ${test.description}\n\n`
    : '';

  const variantsInfo = test.variants.map(v => {
    const ctr = v.impressions ? (v.clicks / v.impressions * 100).toFixed(1) + '%' : '—';
    const cr = v.clicks ? (v.conversions / v.clicks * 100).toFixed(1) + '%' : '—';
    const contentStr = typeof v.content === 'object'
      ? JSON.stringify(v.content, null, 2)
      : String(v.content);

    return `וריאנט ${v.name}:
- צפיות: ${v.impressions}
- קליקים: ${v.clicks}
- המרות: ${v.conversions}
- CTR: ${ctr}
- CR: ${cr}
- תוכן:
${contentStr}`;
  }).join('\n\n');

  return `${description}${variantsInfo}`;
}



module.exports = DailyABTestInsightJob;
