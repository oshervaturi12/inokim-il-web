const express = require('express');
const trackerController = require('../controllers/trackerController');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/stats',authController.protect, authController.restricTo('admin'), trackerController.getTrackerStats);
router.get('/active-users',authController.protect, authController.restricTo('admin'), trackerController.getLiveUsers);
router.get('/abandoned-checkouts',authController.protect, authController.restricTo('admin'), trackerController.getAbandonedCheckouts);

router
  .route('/')
  .get(authController.protect, authController.restricTo('admin'),trackerController.getAllTrackers)
  .post(trackerController.createTrackingEvent);

router
  .route('/:id')
  .get(authController.protect, authController.restricTo('admin'),trackerController.getTracker)
  .patch(authController.protect, authController.restricTo('admin'),trackerController.updateTracker)
  .delete(authController.protect, authController.restricTo('admin'),trackerController.deleteTracker);


router.post('/log-action', trackerController.logAction);


module.exports = router;
