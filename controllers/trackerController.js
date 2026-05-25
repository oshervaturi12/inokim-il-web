const Tracker = require('../models/Tracker');
const factory = require('./handlerFactory');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const Cart = require('../models/Cart')

exports.getAllTrackers = factory.getAll(Tracker, ['sessionId', 'userId', 'pageUrl', 'device', 'browser']);
exports.getTracker = factory.getOne(Tracker);
exports.updateTracker = factory.updateOne(Tracker);
exports.deleteTracker = factory.deleteOne(Tracker);


// ✅ Log each event directly
// exports.createTrackingEvent = catchAsync(async (req, res, next) => {
//   const sessionId = req.session.id;

//   if (!sessionId) {
//     return res.status(400).json({ status: 'fail', message: 'No session ID found.' });
//   }

//   const { action } = req.body;

//   if (!action || !action.type) {
//     return res.status(400).json({ status: 'fail', message: 'Action type is required.' });
//   }

//   const update = {
//     $setOnInsert: {
//       sessionId,
//       userId: req.user ? req.user._id : null, // Optional if logged in
//       device: req.headers['user-agent'],
//     },
//     $push: { actions: action },
//   };

//   const tracker = await Tracker.findOneAndUpdate(
//     { sessionId },
//     update,
//     { upsert: true, new: true, setDefaultsOnInsert: true }
//   );

//   res.status(201).json({
//     status: 'success',
//     data: tracker,
//   });
// });
  
exports.createTrackingEvent = catchAsync(async (req, res, next) => {
  const sessionId = req.session.id;

  if (!sessionId) {
    return res.status(400).json({ status: 'fail', message: 'No session ID found.' });
  }

  const { action } = req.body;

  if (!action || !action.type) {
    return res.status(400).json({ status: 'fail', message: 'Action type is required.' });
  }

  // ✅ Get cart ID based on session
  const cart = await Cart.findOne({ sessionId }).select('_id');

  const update = {
    $setOnInsert: {
      sessionId,
      userId: req.user ? req.user._id : null,
      device: req.headers['user-agent'],
      cartId: cart ? cart._id : null,  // ✅ Attach cart ID
    },
    $push: { actions: action },
  };

  const tracker = await Tracker.findOneAndUpdate(
    { sessionId },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // ✅ If checkout event, mark the session
  if (action.type === 'checkout_start') {
    await Tracker.updateOne({ sessionId }, { $set: { isCheckout: true } });
  }

  // ✅ If conversion, mark session as converted
  if (action.type === 'conversion') {
    await Tracker.updateOne({ sessionId }, { $set: { isConverted: true } });
  }

  res.status(201).json({ status: 'success', data: tracker });
});


// ✅ (Optional) Log an action within an existing tracker session
exports.logAction = catchAsync(async (req, res, next) => {
  const { action } = req.body;

  if (!action || !action.type) {
    return next(new AppError('Action type is required', 400));
  }

  const tracker = await Tracker.findOneAndUpdate(
    { sessionId: req.session.id },
    { $push: { actions: action } },
    { new: true, runValidators: true }
  );

  if (!tracker) {
    return next(new AppError('Tracker session not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { data: tracker },
  });
});


exports.getAbandonedCheckouts = catchAsync(async (req, res, next) => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const abandonedCheckouts = await Tracker.aggregate([
    { $match: { updatedAt: { $lt: tenMinutesAgo }, isCheckout: true, isConverted: { $ne: true } } },
    { $group: { _id: '$sessionId', count: { $sum: 1 } } },
    { $count: 'totalAbandoned' }
  ]);

  res.status(200).json({
    status: 'success',
    totalAbandoned: abandonedCheckouts[0]?.totalAbandoned || 0,
  });
});


exports.getTrackerStats = catchAsync(async (req, res, next) => {
    const stats = await Tracker.aggregate([
      {
        $facet: {
          productViews: [
            { $unwind: '$actions' },
            { $match: { 'actions.type': 'product_view' } },
            { $group: { _id: '$actions.pageUrl', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          checkoutDropoffs: [
            { $unwind: '$actions' },
            { $match: { 'actions.type': 'checkout_dropoff' } },
            { $count: 'totalDropoffs' },
          ],
          scrollDepth: [
            { $unwind: '$actions' },
            { $match: { 'actions.type': 'scroll_depth' } },
            { $group: { _id: null, avgScrollDepth: { $avg: '$actions.scrollDepth' } } },
          ],
          abTestResults: [
            { $unwind: '$actions' },
            { $match: { 'actions.type': 'ab_test_action' } },
            { $group: { _id: '$actions.abTestVariant', count: { $sum: 1 } } },
          ],
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: stats[0],
    });
  });
  
  
  

  exports.getLiveUsers = async (req, res, next) => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  
    const activeUsers = await Tracker.aggregate([
      { $match: { updatedAt: { $gte: tenMinutesAgo } } },
      { $group: { _id: '$sessionId' } },
      { $count: 'activeUsers' }
    ]);
  
    res.status(200).json({
      status: 'success',
      activeUsers: activeUsers[0]?.activeUsers || 0,
    });
  };


