const axios = require("axios");
const crypto = require("crypto");

class MetaCapiService {
  constructor({ pixelId, accessToken, apiVersion = "v21.0" }) {
    if (!pixelId || !accessToken) {
      throw new Error("MetaCapiService: Missing pixelId or accessToken.");
    }

    this.pixelId = pixelId;
    this.accessToken = accessToken;
    this.apiVersion = apiVersion;
    this.endpoint = `https://graph.facebook.com/${this.apiVersion}/${this.pixelId}/events?access_token=${this.accessToken}`;
  }

  /**
   * שליחת אירוע מרכזי ל־Meta CAPI
   */
  async sendEvent(eventName, userData = {}, customData = {}, options = {}) {
    const {
      actionSource = "website",
      eventSourceUrl = null,
      eventTime = Math.floor(Date.now() / 1000),
      eventId = null, // קריטי למניעת כפילויות מול הפיקסל בדפדפן
      testEventCode = null, // לטובת דיבאג
    } = options;

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          action_source: actionSource,
          user_data: this._normalizeUserDataObject(userData),
          custom_data: customData,
          ...(eventSourceUrl ? { event_source_url: eventSourceUrl } : {}),
          ...(eventId ? { event_id: eventId } : {}),
        },
      ],
    };

    if (testEventCode) {
      payload.test_event_code = testEventCode;
    }

    try {
      const res = await axios.post(this.endpoint, payload);
      console.log(`[MetaCapiService] ✅ Sent event: ${eventName} (ID: ${eventId || 'No-ID'})`);
      return res.data;
    } catch (err) {
      const errorData = err.response?.data || err.message;
      console.error(`[MetaCapiService] ❌ Failed sending ${eventName}:`, JSON.stringify(errorData));
      // בפרודקשן עדיף לא לזרוק שגיאה שתפיל את השרת, אלא לרשום ללוג ולהמשיך
      return { success: false, error: errorData };
    }
  }

  /**
   * =========================================
   * אירועים נפוצים (Helpers)
   * כולם מקבלים req (אובייקט הבקשה של Express) 
   * כדי לחלץ IP, UserAgent ו-Cookies אוטומטית.
   * =========================================
   */

  async sendPurchase({ req, value, currency = "ILS", email, phone, contentIds = [], eventId, url }) {
    return this.sendEvent(
      "Purchase",
      this._buildUserData(req, { email, phone }),
      { value, currency, content_ids: contentIds, content_type: "product" },
      { eventSourceUrl: url, eventId }
    );
  }

  async sendAddToCart({ req, email, phone, productId, value, currency = "ILS", eventId, url }) {
    return this.sendEvent(
      "AddToCart",
      this._buildUserData(req, { email, phone }),
      { content_ids: [productId], content_type: "product", value, currency },
      { eventSourceUrl: url, eventId }
    );
  }

  async sendInitiateCheckout({ req, email, phone, value, currency = "ILS", contentIds = [], eventId, url }) {
    return this.sendEvent(
      "InitiateCheckout",
      this._buildUserData(req, { email, phone }),
      { value, currency, content_ids: contentIds, content_type: "product" },
      { eventSourceUrl: url, eventId }
    );
  }

  async sendLead({ req, email, phone, eventId, url }) {
    return this.sendEvent(
      "Lead",
      this._buildUserData(req, { email, phone }),
      {},
      { eventSourceUrl: url, eventId }
    );
  }

  async sendContact({ req, email, phone, eventId, url }) {
    return this.sendEvent(
      "Contact",
      this._buildUserData(req, { email, phone }),
      {},
      { eventSourceUrl: url, eventId }
    );
  }



  _buildUserData(req, { email, phone }) {
    const userData = {};

    if (req) {
      const clientIp = req.ip || req.headers['x-forwarded-for']?.split(',')[0].trim();
      const clientUserAgent = req.headers['user-agent'];
      const fbp = req.cookies?._fbp;
      const fbc = req.cookies?._fbc;

      if (clientIp) userData.client_ip_address = clientIp;
      if (clientUserAgent) userData.client_user_agent = clientUserAgent;
      if (fbp) userData.fbp = fbp;
      if (fbc) userData.fbc = fbc;
    }

    if (email) {
      userData.em = [this._hash(email.trim().toLowerCase())];
    }

    if (phone) {
      const normalizedPhone = this._normalizePhone(phone);
      if (normalizedPhone) {
        userData.ph = [this._hash(normalizedPhone)];
      }
    }

    return userData;
  }

  /**
   * מנקה ערכים ריקים מתוך userData
   */
  _normalizeUserDataObject(userData) {
    return Object.fromEntries(
      Object.entries(userData || {}).filter(([_, v]) => v !== null && v !== undefined && v !== "")
    );
  }

  /**
   * נרמול מספר טלפון לפי דרישות מטא (חובה קידומת מדינה וללא אפס בהתחלה)
   */
  _normalizePhone(phone) {
    if (!phone) return null;
    
    // הסרת כל תו שאינו ספרה
    let cleaned = String(phone).replace(/\D/g, "");
    
    if (!cleaned) return null;

    // התאמה למספרים ישראליים (אם מתחיל ב-05 או 07, הוסף 972 והורד את ה-0)
    // אם האתר שלך פונה לעולם, תצטרך לוודא שהלקוח מזין קידומת בעצמו או להשתמש בספרייה כמו google-libphonenumber
    if (cleaned.startsWith("05") || cleaned.startsWith("07") || cleaned.startsWith("04") || cleaned.startsWith("03") || cleaned.startsWith("02") || cleaned.startsWith("09") || cleaned.startsWith("08")) {
      cleaned = "972" + cleaned.substring(1);
    } else if (cleaned.startsWith("0")) {
      cleaned = "972" + cleaned.substring(1);
    }

    return cleaned;
  }

  /**
   * ביצוע Hash (SHA256)
   */
  _hash(value) {
    if (!value) return null;
    return crypto
      .createHash("sha256")
      .update(String(value))
      .digest("hex");
  }
}

module.exports = MetaCapiService;