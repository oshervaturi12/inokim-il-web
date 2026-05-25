const nodemailer = require('nodemailer');
const ejs = require('ejs');
const moment = require('moment-timezone');
const Settings = require('../models/Settings');


module.exports = class Email {
    constructor(recipients, data, ccRecipients = [], subject) {
        this.to = recipients || ["osher@inokim.com"];
        this.cc = ccRecipients;
        this.from = `INOKIM`;
        this.data = data;
        this.subject = subject;
    }

    createTransport() {
        if (process.env.USE_SENDGRID === 'true') {
            console.log("Using SendGrid for email sending...");
            return nodemailer.createTransport({
                service: 'sendgrid',
                auth: {
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        } else {
            console.log("Using Gmail for email sending...");
            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_FROM,
                    pass: process.env.GOOGLE_PASSWORD
                }
            });
        }
    }

    async sendOrderStatusUpdateToAdmin(order) {
        const settings = await Settings.findOne().lean();
        const adminEmails =  ["osher@inokim.com", 'aviv@inokim.com', 'yoni@inokim.com']
      
        const subject = `עדכון סטטוס להזמנה ${order._id}`;
      
        const email = new Email(adminEmails, order, [], subject);
        await email.send('order_update', subject);
      }
      

    async send(template, subject) {
        try {
            // Render HTML with EJS
            const html = await ejs.renderFile(`${__dirname}/../views/email/${template}.ejs`, {
                data: this.data
            });

            // Email options
            const mailOptions = {
                from: this.from,
                to: this.to.join(','), // Join multiple recipients
                cc: this.cc.length > 0 ? this.cc.join(',') : undefined, // Add CC if available
                subject,
                html,
                messageId: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}@inokim.com`

            };

            // Send the email
            await this.createTransport().sendMail(mailOptions);
            console.log(`Email sent to: ${this.to.join(', ')}`);
        } catch (error) {
            console.error("Error sending email:", error);
        }
    }


    async sendAdminNotification(notificationType, details) {
        const timestamp = moment().tz("Asia/Jerusalem").format("DD.MM.YYYY HH:mm:ss");
    
        // Define notification titles
        const titles = {
            "new_order": " הזמנה חדשה התקבלה!",
            "contact": " יצירת קשר חדשה!",
            "test-ride": " בקשה לנסיעת מבחן חדשה!",
            "business": " ליד חדש לעסקים!",
            "newsletter": " ניוזלטר חדש נרשם!",
            "secondHand": " ליד חדש ליד שניה!",
            "tradeId": "בקשת טרייד אין חדשה!",
            "standingOrder": "בקשה להוראת קבע!",
            "purchase-group": " הרשמה חדשה לקבוצת רכישה!",
            "generic": " התראת מנהל חדשה!"
        };
    
        const subject = titles[notificationType] || titles.generic;
        // const adminEmails = ["osher@inokim.com", "aviv@inokim.com", "kfir@inokim.com"];
        const settings = await Settings.findOne().lean();
        const adminEmails = settings?.adminEmails?.length
        ? settings.adminEmails
        : ['osher@inokim.com']; // fallback
    
        // Format product details
        if (notificationType === "new_order" && details.products) {
            details.productList = details.products.map(product => 
                `📦 <strong>${product.prdName}</strong> - ${product.quantity} יחידות | מחיר: ₪${product.price}`
            ).join("<br>");
        }
    
        // Format transaction details
        if (notificationType === "new_order" && details.transactions.length > 0) {
            details.transactionDetails = details.transactions.map(transaction =>
                `**סוג תשלום:** ${transaction.type} <br>
                  **סטטוס תשלום:** ${details.paymentStatus} <br>
                  **סכום:** ₪${transaction.amount} <br>
                  **מספר אישור:** ${transaction.cardDetails?.approval_num || 'N/A'} <br>
                  **מנפיק הכרטיס:** ${transaction.cardDetails?.issuer_name || 'N/A'} <br>
                  **ספרות אחרונות:** ${transaction.cardDetails?.four_digits || 'N/A'} <br>
                  **תשלומים:** ${transaction.cardDetails?.number_of_payments || 1}`
            ).join("<br><br>");
        } else {
            details.transactionDetails = " אין פרטי תשלום זמינים";
        }
    
        // Format shipping address
        if (notificationType === "new_order" && details.shippingMethod === "home_delivery") {
            details.shippingAddress = `
                 **עיר:** ${details.shippingAddress.city || 'N/A'} <br>
                 **כתובת:** ${details.shippingAddress.address || 'N/A'}, ${details.shippingAddress.addressNum || 'N/A'} <br>
                 **קומה:** ${details.shippingAddress.homeFloor || 'N/A'}, דירה: ${details.shippingAddress.homeNum || 'N/A'} <br>
                 **קוד כניסה:** ${details.shippingAddress.homeEntranceCode || 'N/A'}
            `;
        } else {
            details.shippingAddress = " **איסוף עצמי** מהחנות";
        }
    
        details.timestamp = timestamp;
        details.notificationType = subject;
        details.title = subject;
    
        const email = new Email(adminEmails, details, [], subject);
        await email.send("admin_notification", subject);
    }

    
    
};
