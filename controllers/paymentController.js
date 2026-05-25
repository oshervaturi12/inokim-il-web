const OrderService = require('../services/PayPlus');
const redisClient = require('../redisClient');
const catchAsync = require('../util/catchAsync');
const AppError = require('./../util/appError')

exports.processPayment = catchAsync( async (req, res, next) => {

    const { customerId, customerData, amount } = req.body;

    if (!customerId || !customerData || !amount) {
        return next(new AppError("Missing required fields", 404))
    }

    const cacheKey = `payment:${customerId}:${amount}`;

    // Prepare order data
    const orderData = OrderService.prepareOrderData(customerData, amount);

    // Call PayPlus API
    const response = await OrderService.makeOrder(orderData);

    // Cache the successful transaction
    await redisClient.setEx(cacheKey, 300, JSON.stringify(response)); // Cache for 5 minutes

    res.json(response);

});
