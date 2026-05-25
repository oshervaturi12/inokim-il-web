

// const orderEvents = require('../events/orderEvents');
const eventEmitter = require('../events'); 
const TwilioService = require('../services/TwilioService');
const Email = require('../util/email');



eventEmitter.on('orderPaid', async (order) => {
  try {
    console.log(`Processing notifications for order ${order._id}`);

    // Send SMS Notification via Twilio
    try {
      const smsMessage = `✔️ תשלום בוצע עבור הזמנה מספר: ${order._id}, שם לקוח: ${order.contactInfo.firstName}, טלפון: ${order.contactInfo.phone}`;
      await TwilioService.sendSms(smsMessage);
      console.log(`📲 SMS sent successfully for order ${order._id}`);
    } catch (smsError) {
      console.error(`❌ SMS sending failed for order ${order._id}:`, smsError.message);
    }

    // Send confirmation email to the user
    try {
      const userEmail = new Email(
        [order.contactInfo.email],  
        order,                
        ["osher@inokim.com"],
        `אישור הזמנה מ-INOKIM}`
      );
      await userEmail.send('order_confirmation', `אישור הזמנה מ-INOKIM #${order._id}`);
      console.log(`📧 Order confirmation email sent to ${order.contactInfo.email} for order ${order._id}`);
    } catch (emailError) {
      console.error(`❌ Order confirmation email failed for order ${order._id}:`, emailError.message);
    }

    // Notify admin about the new order
    try {
      const adminEmail = new Email();
      await adminEmail.sendAdminNotification("new_order", {
        orderId: order._id,
        customerName: order.contactInfo.firstName,
        phone: order.contactInfo.phone,
        email: order.contactInfo.email,
        totalAmount: order.totalPrice,
        paymentType: order.paymentType,
        paymentStatus: order.paymentStatus,
        shippingMethod: order.shippingMethod,
        shippingAddress: order.shippingAddress,
        transactions: order.transactions,
        products: order.items,
        shooping: order.shippingCost,
        coupon: order.coupon ? order.coupon : null,
      });

      console.log(`📧 Admin notified about new order ${order._id}`);
    } catch (adminEmailError) {
      console.error(`❌ Admin notification email failed for order ${order._id}:`, adminEmailError.message);
    }

    console.log(`✅ Notifications process completed for order ${order._id}`);
  } catch (error) {
    console.error(`❌ Unexpected error in order notification handler for order ${order._id}:`, error);
  }
});

console.log("✅ Order event listener is running...");

