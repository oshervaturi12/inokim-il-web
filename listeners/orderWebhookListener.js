const axios = require('axios');
const eventEmitter = require('../events');
const scooterMap = require('../util/scooterMap');

const TOKEN = process.env.ORDER_MIGRATION_TOKEN;

eventEmitter.on('orderWebhookReady', async (order) => {
  try {
    console.log(`Sending order ${order._id} to external system`);

    for (const item of order.items) {
      const qty = item.quantity || 1;
      const sku = item.sku || '';
      const mapData = scooterMap[sku];

      const payload = {
        name: (mapData?.name ?? 'Unknown Product') || item.prdName ,
        price: item.price / 1.18,
        date: new Date(order.createdAt),
        qty,
        sku,
        factoryStu: sku,
        orderId: order._id.toString(),
        from: 'Shopify IL',
        // status: order.orderStatus || 'processing',
        type: mapData ? 1 : 2, 
        prdId: mapData?.id || 0,
        cogs: mapData ? (mapData.cogs || 0) * qty : 0
      };

      try {
        await axios.post('https://osher.herokuapp.com/api/v1/orders', payload, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        });
        console.log('Sent order to external system:', payload);
      } catch (err) {
        console.error('Failed to send order:', payload, err.response?.data || err.message);
      }
    }

    console.log(`✅ Completed external sync for order ${order._id}`);
  } catch (err) {
    console.error(`❌ Webhook error for order ${order._id}:`, err.message);
  }
});

console.log('✅ Webhook listener loaded...');
