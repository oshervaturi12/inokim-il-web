
const express = require('express');
const abtestController = require('./../controllers/abTest')
const router = express.Router();
const authController = require('./../controllers/authController')

router.post('/impression',abtestController.trackImpression);
router.post('/click', abtestController.trackABTestClick);
router.post('/conversion', abtestController.trackABTestConversion);
router.get('/insight/:id', abtestController.getABTestInsights);

router
    .route('/')
    .get(abtestController.getAllABTests)
    .post(abtestController.createABTests)
router
    .route('/:id')
    .get(abtestController.getABTests)
    .patch(abtestController.updateABTests)
    .delete(abtestController.deleteABTests)

module.exports = router;