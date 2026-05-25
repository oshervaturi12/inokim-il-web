
const express = require('express');
const router = express.Router();
const vatModeController = require('../controllers/vatModeController');


router.get('/set-no-vat', vatModeController.setNoVAT);
router.get('/unset-no-vat', vatModeController.unsetNoVAT);

module.exports = router;
