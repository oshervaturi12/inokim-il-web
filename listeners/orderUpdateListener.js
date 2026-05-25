const eventEmitter = require('../events');
const Email = require('../util/email');

eventEmitter.on('orderUpdated', async (order) => {
    try {
      const email = new Email();
      await email.sendOrderStatusUpdateToAdmin(order);
      console.log(`📧 Admin notified about status update for order ${order._id}`);
    } catch (error) {
      console.error(`❌ Failed to send admin order status update:`, error.message);
    }
  });

console.log("✅ Order update event listener is running...");
