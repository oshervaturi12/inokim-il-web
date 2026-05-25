const express = require('express');
const router = express.Router();
const adsController = require('../controllers/adsController');

router.get('/', adsController.renderGoogleAdsCampaigns);
router.get('/clicks-per-day', adsController.getClicksChartData);

module.exports = router;