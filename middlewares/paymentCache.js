const redisClient = require('../redisClient');
const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsync');

exports.cachePayment = catchAsync(async (req, res, next) => {
    const { amount } = req.body;

    console.log(req.sessionID)

    // Extract sessionId from req.session
    const sessionId = req.sessionID;

    if (!sessionId || !amount) {
        return next(new AppError('Missing sessionId or amount', 400)); // Use 400 for bad requests
    }

    const cacheKey = `payment:${sessionId}:${amount}`;
    const cachedPayment = await redisClient.get(cacheKey);

    if (cachedPayment) {
        console.log(`⚡ Serving Cached Payment for Session: ${sessionId}`);
        return res.json(JSON.parse(cachedPayment));
    }

    next();
});
