// const { GoogleAdsApi , services} = require('google-ads-api');

// const client = new GoogleAdsApi({
//   client_id: process.env.GOOGLE_CLIENT_ID,
//   client_secret: process.env.GOOGLE_CLIENT_SECRET,
//   developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
// });



// const customer = client.Customer({
//   customer_id: '5323491823', 
//   login_customer_id: '8599814498',
//   refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
// });



// const getActiveCampaigns = async () => {
//   try {
//     const campaigns = await customer.query(`
//         SELECT
//         campaign.id,
//         campaign.name,
//         campaign.status,
//         campaign.start_date,
//         campaign.end_date,
//         campaign.advertising_channel_type,
//         campaign_budget.amount_micros,
//         metrics.impressions,
//         metrics.clicks,
//         metrics.ctr,
//         metrics.average_cpc,
//         metrics.cost_micros,
//         metrics.conversions
//       FROM campaign
//       WHERE campaign.status = 'ENABLED'
//       AND segments.date DURING LAST_30_DAYS

//     `);
//     return campaigns;
//   } catch (err) {
//     console.error('❌ Error fetching active campaigns:', err);
//     throw err;
//   }
// };

// const getClicksPerDay = async () => {
//   try {
//     const results = await customer.query(`
//       SELECT
//         segments.date,
//         metrics.clicks
//       FROM campaign
//       WHERE campaign.status = 'ENABLED'
//       AND segments.date DURING LAST_30_DAYS
//     `);

//     // Aggregate per date (some days may repeat across campaigns)
//     const clicksByDate = {};

//     for (const row of results) {
//       const date = row.segments.date;
//       const clicks = row.metrics.clicks || 0;

//       if (!clicksByDate[date]) clicksByDate[date] = 0;
//       clicksByDate[date] += clicks;
//     }

//     // Sort by date
//     const sortedDates = Object.keys(clicksByDate).sort();

//     return {
//       labels: sortedDates,
//       clicks: sortedDates.map(date => clicksByDate[date]),
//     };
//   } catch (err) {
//     console.error('❌ Error fetching clicks per day:', err);
//     throw err;
//   }
// };


// (async () => {
//   try {


//     const clickConversion = {
//       gclid: "CjwKCAjwq9rFBhAIEiwAGVAZPw3f0ofKJP9-8l-E3a2FOLzQwbZRXx1nla_T6qPmB5XDCMveyQwvVRoCVBwQAvD_BwE",
//       conversion_action: "customers/5323491823/conversionActions/7290021981",
//       conversion_date_time: "2025-09-03 16:30:00+03:00",

//       conversion_value: 123,
//       currency_code: "USD",
//     };

//     const request = new services.UploadClickConversionsRequest({
//       customer_id: "5323491823",
//       conversions: [clickConversion],
//        partial_failure: true,  
//       validate_only: true 
//     });

//     const res =  await customer.conversionUploads.uploadClickConversions(request);

//     console.log(res)


//   } catch (err) {
//     console.error("❌ Error fetching customer info:", err);
//   }
// })
// ();



// (async () => {
//   try {

//     const conversions = await customer.query(`
//   SELECT
//     conversion_action.id,
//     conversion_action.name,
//     conversion_action.type,
//     conversion_action.status
//   FROM conversion_action
//   WHERE conversion_action.status = ENABLED
// `);
// console.log(conversions);

//     // console.log("✅ Upload response:", response);
//   } catch (err) {
//     console.error("❌ Error uploading conversion:", err);
//   }
// }) ();


async function getConversionTrackingSettings() {
  try {
    const results = await customer.query(`
      SELECT
        customer.conversion_tracking_setting.google_ads_conversion_customer,
        customer.conversion_tracking_setting.conversion_tracking_status,
        customer.conversion_tracking_setting.conversion_tracking_id,
        customer.conversion_tracking_setting.cross_account_conversion_tracking_id
      FROM customer
    `);

    console.log("✅ Conversion Tracking Settings:");
    results.forEach(row => {
      console.log({
        google_ads_conversion_customer: row.customer.conversion_tracking_setting.google_ads_conversion_customer,
        conversion_tracking_status: row.customer.conversion_tracking_setting.conversion_tracking_status,
        conversion_tracking_id: row.customer.conversion_tracking_setting.conversion_tracking_id,
        cross_account_conversion_tracking_id: row.customer.conversion_tracking_setting.cross_account_conversion_tracking_id,
      });
    });

    return results;
  } catch (err) {
    console.error("❌ Error fetching conversion tracking settings:", err);
    throw err;
  }
}

const getClicksPerDay = async () => {
  console.log("run")
};

// getConversionTrackingSettings()

const getActiveCampaigns = async () => {
  console.log("run")
};

module.exports = {
  getActiveCampaigns,
  getClicksPerDay
};
