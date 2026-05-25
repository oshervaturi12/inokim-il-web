const axios = require('axios');
const AppError = require('../util/appError');
const crypto = require('crypto');

class OrderService {
  constructor({ apiBase, apiKey, apiSecret, defaultEndpoint }) {
    this.apiBase = apiBase;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.defaultEndpoint = defaultEndpoint || 'PaymentPages/generateLink';
  }

  roundToTwo(num) {
    return +(Math.round(num + 'e+2') + 'e-2');
  }

  async makeOrder(data, endpoint = this.defaultEndpoint) {
    try {
      const response = await axios.post(`${this.apiBase}${endpoint}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': JSON.stringify({
            api_key: this.apiKey,
            secret_key: this.apiSecret,
          }),
        },
      });

      return response.data; 
    } catch (error) {
      throw new AppError(
        error.response?.data?.message || 'Error making order',
        error.response?.status || 500
      );
    }
  }

  resolvePayPlusHash(response, secretKey) {
    if (!response) return false;
    if (response.headers['user-agent'] !== 'PayPlus') return false;

    const message = response.body && JSON.stringify(response.body);
    if (!message) return false;

    const hash = response.headers['hash'];
    if (!hash) return false;

    const genHash = crypto.createHmac('sha256', secretKey)
      .update(message)
      .digest('base64');

    return genHash === hash;
  }

  prepareOrderData(clientData, amount, includeVat = true) {
    return {
      payment_page_uid: process.env.PaymentPageUid,
      expiry_datetime: '30',
      more_info: "",
      refURL_success: null,
      payments: 36, 
      currency_code: 'ILS',
      sendEmailApproval: true,
      sendEmailFailure: false,
      customer: clientData,
      amount: this.roundToTwo(amount),
      charge_method: 1,
      paying_vat: includeVat
    };
  }
}

module.exports = new OrderService({
  apiBase: process.env.API,
  apiKey: process.env.APIKEY,
  apiSecret: process.env.APISECRET,
  defaultEndpoint: 'PaymentPages/generateLink',
});
