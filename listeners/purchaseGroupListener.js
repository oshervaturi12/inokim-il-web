const axios = require('axios');
const eventEmitter = require('../events');


  eventEmitter.on('purchase-group', async (data) => {
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        createdAt: data.createdAt,
      };

      await axios.post(
        process.env.PURCHASE_GROUP_API_URL,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.PURCHASE_GROUP_API_KEY}`,
          },
          timeout: 8000,
        }
      );

      console.log('[purchase-group] Payload sent successfully');
    } catch (error) {
      console.error(
        '[purchase-group] Failed to send payload',
        error.response?.data || error.message
      );
    }
  });
