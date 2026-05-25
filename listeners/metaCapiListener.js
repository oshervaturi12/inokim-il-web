const eventEmitter = require("../events");
const MetaCapiService = require("../services/MetaCapiService");

const meta = new MetaCapiService({
  pixelId: process.env.METAPIXELID || "2511924365726545",
  accessToken: process.env.CAPI,
});

eventEmitter.on("metaEvent", async (event) => {
  try {
    const { type, data, req } = event;

    console.log(`[MetaCAPI] Received event: ${type}`);

    const payload = { req, ...data };

    switch (type) {
      case "purchase":
        await meta.sendPurchase(payload);
        break;

      case "add_to_cart":
        await meta.sendAddToCart(payload);
        break;

      case "wishlist":
        await meta.sendAddToWishlist(payload);
        break;

      case "view_content":
        await meta.sendViewContent(payload);
        break;

      case "initiate_checkout":
        await meta.sendInitiateCheckout(payload);
        break;

      case "registration":
        await meta.sendCompleteRegistration(payload);
        break;

      case "subscribe":
        await meta.sendSubscribe(payload);
        break;

      case "contact":
      case "TestEvent": // איחדתי אותם כי הם מפעילים את אותה פונקציה
        await meta.sendContact(payload);
        break;

      case "search":
        await meta.sendSearch(payload);
        break;

      default:
        console.warn(`[MetaCAPI] Unknown event type: ${type}`);
        return; // עוצרים כאן כדי לא להדפיס "הצלחה" על אירוע לא מוכר
    }

    console.log(`[MetaCAPI] Event sent successfully: ${type}`);
  } catch (err) {
    console.error(`[MetaCAPI] Failed to send ${event.type}:`, err.message);
  }
});

console.log(" Meta CAPI listener loaded and waiting for events...");