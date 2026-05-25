// const eventEmitter = require('../events');
// const Email = require('../util/email');
// const axios = require('axios');

// const types = {
//   "contact": "יצירת קשר",
//   "test-ride": "נסיעת מבחן",
//   "business": "יצירת קשר עסקים",
//   "newsletter": "ניוזלטר חדש",
//   "secondHand": "ליד יד שניה",
//   "standingOrder": "הוראת קבע",
//   "tradeId": "טרייד אין",
//   "purchase-group": "הרשמה חדשה לקבוצת רכישה"
// };

// eventEmitter.on('formSubmitted', async (formData) => {
//   try {
//       console.log("Contact form submission event detected:", formData);

//       // Get the readable form type; if not found, default to "form_submission"
//       const formType = formData.type in types ? formData.type : "generic";


      

//       const adminEmail = new Email();
//       await adminEmail.sendAdminNotification(formType, {
//           title: `📩 טופס ${types[formType] || "ליד חדש"} מולא באתר`,
//           notificationType: types[formType] || "ליד חדש",
//           customerName: formData.fullName,
//           email: formData.email,
//           phone: formData.phone,
//           message: formData.message !== "No message provided" ? formData.message : "📝 ללא הודעה",
//           model: formData.model && formData.model !== "N/A" ? formData.model : null,
//           serialNum: formData.serialNum && formData.serialNum !== "N/A" ? formData.serialNum : null,
//           preferredDate: formData.preferredDate && formData.preferredDate !== "N/A" ? formData.preferredDate : null,
//           location: formData.location && formData.location !== "N/A" ? formData.location : null,
//           timestamp: new Date().toISOString().split('T')[0]
//       });

//       console.log("📧 Admin notified about form submission.");
//   } catch (error) {
//       console.error("❌ Error notifying admin about form submission:", error);
//   }
// });





const eventEmitter = require('../events');
const Email = require('../util/email');
const axios = require('axios'); 

const types = {
  "contact": "יצירת קשר",
  "test-ride": "נסיעת מבחן",
  "business": "יצירת קשר עסקים",
  "newsletter": "ניוזלטר חדש",
  "secondHand": "ליד יד שניה",
  "standingOrder": "הוראת קבע",
  "tradeId": "טרייד אין",
  "purchase-group": "הרשמה חדשה לקבוצת רכישה"
};

eventEmitter.on('formSubmitted', async (formData) => {
  console.log("Contact form submission event detected:", formData);

  const formType = formData.type in types ? formData.type : "generic";
  const formTag = types[formType] || "ליד חדש";

  try {
      const adminEmail = new Email();
      await adminEmail.sendAdminNotification(formType, {
          title: `📩 טופס ${formTag} מולא באתר`,
          notificationType: formTag,
          customerName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          message: formData.message !== "No message provided" ? formData.message : "📝 ללא הודעה",
          model: formData.model && formData.model !== "N/A" ? formData.model : null,
          serialNum: formData.serialNum && formData.serialNum !== "N/A" ? formData.serialNum : null,
          preferredDate: formData.preferredDate && formData.preferredDate !== "N/A" ? formData.preferredDate : null,
          location: formData.location && formData.location !== "N/A" ? formData.location : null,
          timestamp: new Date().toISOString().split('T')[0]
      });

      console.log("📧 Admin notified about form submission.");
  } catch (error) {
      console.error("❌ Error notifying admin about form submission:", error);
  }

  try {
      let crmNotes = `סוג פנייה: ${formTag}\n`;
      if (formData.message && formData.message !== "No message provided") crmNotes += `הודעה: ${formData.message}\n`;
      if (formData.model && formData.model !== "N/A") crmNotes += `דגם/מוצר: ${formData.model}\n`;
      if (formData.location && formData.location !== "N/A") crmNotes += `סניף נבחר: ${formData.location}\n`;
      if (formData.preferredDate && formData.preferredDate !== "N/A") crmNotes += `תאריך מבוקש: ${formData.preferredDate}\n`;

      const leadData = {
          status: "new",
          leadType: "website",
          tag: formTag,
          phone: formData.phone || "",
          fullName: formData.fullName || "ללא שם",
          createdAt: new Date(),
          notes: crmNotes.trim()
      };

      const crmResponse = await axios.post('https://osher.herokuapp.com/api/v1/leads', leadData);
      console.log('Form Lead sent to CRM successfully:', crmResponse.data);

  } catch (error) {
      console.error(' Error sending form lead to CRM:', error.response?.data || error.message);
  }
});
