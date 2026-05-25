const { getActiveCampaigns, getClicksPerDay } = require('../services/googleAdsService');


function getClicksByCampaign(campaigns) {
  return {
    labels: campaigns.map(c => c.campaign.name),
    clicks: campaigns.map(c => c.metrics.clicks || 0),
  };
}


exports.renderGoogleAdsCampaigns = async (req, res, next) => {
  try {
    const campaigns = await getActiveCampaigns();

      // Aggregation
      let totalClicks = 0;
      let totalImpressions = 0;
      let totalCostMicros = 0;

      for (const item of campaigns) {
        totalClicks += item.metrics.clicks || 0;
        totalImpressions += item.metrics.impressions || 0;
        totalCostMicros += item.metrics.cost_micros || 0;
      }

      const totalCost = totalCostMicros / 1_000_000; // הופך למטבע רגיל
      const averageCPC = totalClicks > 0 ? totalCost / totalClicks : 0;


    res.status(200).json({
      status: 'success',
      data: campaigns,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};


// exports.getClicksChartData = async (req, res, next) => {
//   try {
//     const chartData = await getClicksPerDay();
//     res.status(200).json(chartData);
//   } catch (err) {
//     res.status(500).json({ status: 'error', message: err.message });
//   }
// };


exports.getClicksChartData = async (req, res) => {
  try {
    const campaigns = await getActiveCampaigns();
    const chartData = getClicksByCampaign(campaigns);

    console.log(chartData)

    res.status(200).json(chartData);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};