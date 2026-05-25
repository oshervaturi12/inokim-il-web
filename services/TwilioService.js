const twilio = require('twilio');

class TwilioService {
  constructor() {
    const accountSid = process.env.SID;
    const authToken = process.env.TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Twilio SID and TOKEN must be provided in environment variables.');
    }

    this.client = twilio(accountSid, authToken);
    this.defaultFrom = 'INOKIM';
    this.defaultTo = '+972508693737';
  }

  async sendSms(message, to = this.defaultTo) {
    try {
      const response = await this.client.messages.create({
        body: message,
        from: this.defaultFrom,
        to: to
      });

      console.log(`✅ SMS sent with status: ${response.status}`);
      return response;
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      throw error;
    }
  }
}

module.exports = new TwilioService();
