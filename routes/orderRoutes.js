const express = require('express');
const  orderController = require('../controllers/orderController');
const paymentCache = require('../middlewares/paymentCache');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/checkout', paymentCache.cachePayment, orderController.createOrder); 
router.post('/callback', orderController.callbackGetaway); 

router.get('/stats', authController.protect, authController.restricTo('admin'), orderController.getOrderChartData);

router.patch('/:id/close',authController.protect,authController.restricTo('admin'), orderController.updateOrderDetails);

router
    .route('/')
    .get(authController.protect, authController.restricTo('admin'),orderController.getAllOrders)
router
    .route('/:id')
    .get(authController.protect, authController.restricTo('admin'),orderController.getOrder)
    .patch(authController.protect, authController.restricTo('admin'),orderController.updateOrder)
    .delete(authController.protect, authController.restricTo('admin'),orderController.deleteOrder)

module.exports = router;
