const cron = require('node-cron');
const DailyABTestInsightJob = require('./dailyAbTestInsightJob');
const moment = require('moment-timezone');

console.log('📅 Cron scheduler initialized');

// 🇮🇱 Run every day at 3:00 AM Israel time
cron.schedule('0 3 * * *', async () => {
  const now = moment().tz('Asia/Jerusalem').format('YYYY-MM-DD HH:mm');
  console.log(`🔁 [${now}] Running daily A/B test insights job...`);
  await DailyABTestInsightJob.run();
}, {
  timezone: 'Asia/Jerusalem'
});