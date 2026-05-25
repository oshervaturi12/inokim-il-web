const Order = require('../models/Order');
const Cart = require('../models/Cart');
const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsync');
const redisClient = require('../redisClient');
const OrderService = require('../services/PayPlus'); 
const eventEmitter = require('../events');
const factory = require('./handlerFactory')
const moment = require('moment-timezone');
const Coupon = require('../models/Coupon');



exports.createOrder = catchAsync(async (req, res, next) => {
  const sessionId = req.sessionID;
  const notIncludeVat = req.noVAT;

  const isLocked = await redisClient.get(`order-lock:${sessionId}`);
  if (isLocked) {
      return next(new AppError('ההזמנה כבר בתהליך, אנא המתן', 429));
  }

  await redisClient.setWithOptions(`order-lock:${sessionId}`, 'locked', { EX: 1, NX: true });

  try {
      const existingOrder = await redisClient.get(`order:${sessionId}`);
  

      const { first_name, last_name, email, phone, shipping_method, payment_type, note, newsletter, userId } = req.body;

      const cart = await Cart.findOne({ sessionId }).populate('coupon');

      if (!cart || cart.items.length === 0) {
          await redisClient.del(`order-lock:${sessionId}`);
          return next(new AppError('Cart is empty', 400));
      }

      let shippingCost = 0;
      let shippingAddress = {};
      const hasCoupon = !!cart.coupon;


      if (shipping_method === 'home_delivery') {
        if (notIncludeVat === true) {
          shippingAddress = {
            hotelName: req.body.hotelName,
            arrivalDate: req.body.arrivalDate,
            note: req.body.note
          };

          shippingCost = hasCoupon ? 0 : 100;
        } else {
          shippingAddress = {
            city: req.body.city,
            address: req.body.address,
            addressNum: req.body.address_num,
            homeNum: req.body.home_num,
            homeFloor: req.body.home_floor,
            homeEntrance: req.body.home_entrance,
            homeEntranceCode: req.body.home_entrance_code,
            note: req.body.note
          };

          shippingCost = hasCoupon ? 0 : 250;
        }
      } else {
        shippingCost = 0;
      }

      const order = new Order({
          sessionId,
          userId,
          items: cart.items,
          totalPrice: cart.totalPrice,
          discount: cart.discount,
          coupon: cart.coupon?._id || null,
          shippingMethod: shipping_method,
          shippingCost,
          shippingAddress,
          contactInfo: {
              firstName: first_name,
              lastName: last_name,
              email,
              phone
          },
          paymentType: payment_type,
          notes: note,
          newsletter: newsletter === 'on'
      });

      await order.save();
      if (cart.coupon?._id) {
        await Coupon.findByIdAndUpdate(cart.coupon._id, {
          $inc: { usedCount: 1 },
          $set: { active: false }
        });
      }

    const finalAmountToCharge = Number((order.totalPrice || 0) + (order.shippingCost || 0));

if (finalAmountToCharge <= 0) {
  order.paymentStatus = 'paid';
  order.orderStatus = 'processing';
  order.lastStatusModifiedDate = new Date();
  await order.save();

  eventEmitter.emit('orderWebhookReady', order);
  eventEmitter.emit('orderPaid', order);
  eventEmitter.emit("metaEvent", {
    type: "purchase",
    req: req,
    data: {
      value: 0,
      currency: "ILS",
      email: order.contactInfo.email,
      phone: order.contactInfo.phone,
      url: `/thank-you/${order._id}`,
    },
  });

  await redisClient.del(`order-lock:${sessionId}`);

  req.session.destroy((err) => {
    if (err) {
      console.error("Failed to destroy session:", err);
    } else {
      console.log("Session destroyed after zero-price order.");
    }

    return res.status(201).json({
      status: 'success',
      data: {
        redirectUrl: `/thank-you/${order._id}`
      }
    });
  });

  return;
}

      if (payment_type === 'paymentPhone') {
        order.paymentStatus = 'pending';
        await order.save();
      
        eventEmitter.emit('orderPaid', order); 

        eventEmitter.emit("metaEvent", {
          type: "purchase",
          req: req,
          data: {
            value: order.totalPrice,
            currency: "ILS",
            email: order.contactInfo.email,
            phone: order.contactInfo.phone,
            url:  `/thank-you/${order._id}`,
          },
        });

        await redisClient.del(`order-lock:${sessionId}`);

        req.session.destroy((err) => {
          if (err) {
            console.error("Failed to destroy session:", err);
          } else {
            console.log("Session destroyed after phone payment.");
          }
          return res.status(201).json({
            status: 'success',
            data: {
              redirectUrl: `/thank-you/${order._id}`
            }
          });
        });
      
        return; 
      }

      const paymentData = OrderService.prepareOrderData(
        { customer_name: `${first_name} ${last_name}`, email, phone }, 
        (order.totalPrice + order.shippingCost), 
        notIncludeVat
      );

      const paymentResponse = await OrderService.makeOrder(paymentData);
      console.log('Payment Gateway Response:', paymentResponse);

      if (paymentResponse.results.status !== 'success') {
          await redisClient.del(`order-lock:${sessionId}`);
          return next(new AppError('Payment processing failed', 400));
      }

      order.paymentGatewayPageId = paymentResponse.data.page_request_uid;
      order.paymentLink = paymentResponse.data.payment_page_link;
      await order.save();

      await redisClient.setEx(`order:${sessionId}`, 300, JSON.stringify(order));

      await redisClient.del(`order-lock:${sessionId}`);

      return res.status(201).json({
        status: 'success',
        data: {
            data: paymentResponse.data.page_request_uid
        }
      });

  } catch (err) {
      await redisClient.del(`order-lock:${sessionId}`);
      throw err; 
  }
});

exports.callbackGetaway = catchAsync(async (req, res, next) => {
    const { data, transaction } = req.body;
  
    if (!transaction) {
      return next(new AppError('Missing transaction data', 400));
    }
  
    console.log('Transaction:', transaction);
  

    if (!OrderService.resolvePayPlusHash(req, process.env.APISECRET)) {
      return next(new AppError('Invalid Hash', 400));
    }
  

    const orderData = await Order.findOne({ paymentGatewayPageId: transaction.payment_page_request_uid });
  
    if (!orderData) {
      return next(new AppError('No order found', 404));
    }
  

    const newTransaction = {
      type: 'paymentLink',
      amount: transaction.amount || 0,
      cardDetails: {
        approval_num: transaction.approval_number || null,
        voucher_num: transaction.voucher_number || null,
        four_digits: data?.card_information?.four_digits || null,
        expiry_month: data?.card_information?.expiry_month || null,
        expiry_year: data?.card_information?.expiry_year || null,
        issuer_name: transaction.rrn || null,
        number_of_payments: transaction.payments?.number_of_payments || null,
        first_payment_amount: transaction.payments?.first_payment_amount || null,
        rest_payments_amount: transaction.payments?.rest_payments_amount || null,
      },
      transactionDate: new Date(),
      message: transaction.message || null,
    };
  
    // Update the order
    orderData.paymentStatus = transaction.approval_number ? 'paid' : 'failed';
    orderData.paymentGatewayTransactionId = transaction.uid;
    orderData.lastStatusModifiedDate = new Date();
  
    // Push the new transaction to the transactions array
    orderData.transactions.push(newTransaction);
  
    const updatedOrder = await orderData.save();
  
    if (!updatedOrder) {
      return next(new AppError('Failed to update order', 500));
    }

    if (newTransaction.cardDetails.approval_num && orderData.paymentStatus === 'paid') {
      console.log("true")
      eventEmitter.emit('orderPaid', updatedOrder); 
      eventEmitter.emit('orderWebhookReady', updatedOrder);
    }
  

    return res.status(200).send('Callback processed successfully');


   
  });





  exports.getAllOrders = factory.getAll(Order)
  

  exports.getOrder = factory.getOne(Order)
  
  exports.updateOrder = factory.updateOne(Order)
  
  exports.deleteOrder = factory.deleteOne(Order)



exports.getOrderChartData = catchAsync( async (req, res) => {
  const months = Array.from({ length: 12 }, (_, i) =>
    moment().month(i).format('MMMM')
  );

  const startOfYear = moment().startOf('year').toDate();
  const endOfYear = moment().endOf('year').toDate();

  const data = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfYear, $lte: endOfYear },
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
      },
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Map orders by month
  const ordersPerMonth = new Array(12).fill(0);
  const revenuePerMonth = new Array(12).fill(0);

  data.forEach(item => {
    const index = item._id - 1;
    ordersPerMonth[index] = item.totalOrders;
    revenuePerMonth[index] = item.totalRevenue;
  });

  res.json({
    labels: months,
    orders: ordersPerMonth,
    revenue: revenuePerMonth,
  });
});



exports.updateOrderDetails = catchAsync(async (req, res, next) => {
  const { orderStatus, fulfilledFrom, serialNumbers, notes } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if(notes){
    order.notes = notes;
  }

  //  Update fulfilledFrom
  if (fulfilledFrom !== undefined) {
    order.fulfilledFrom = fulfilledFrom;
  }

  //  Update orderStatus
  if (orderStatus && ['processing', 'shipped', 'delivered', 'cancelled'].includes(orderStatus)) {
    order.orderStatus = orderStatus;
    order.lastStatusModifiedDate = new Date();
  }

  //  Update serial numbers for items
  if (serialNumbers && typeof serialNumbers === 'object') {
    order.items.forEach(item => {
      const itemId = item.variantId.toString();
      if (serialNumbers[itemId]) {
        item.serialNumber = serialNumbers[itemId];
      }
    });
  }

  await order.save({ validateModifiedOnly: true });

  eventEmitter.emit('orderUpdated', order);

  res.status(200).json({
    status: 'success',
    message: 'Order updated successfully',
    data: {
      order
    }
  });
});



