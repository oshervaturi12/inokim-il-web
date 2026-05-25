// adminPagesConfig.js

const Product = require('../models/Products');
const Settings = require('../models/Settings');
const Redirect = require('../models/Redirect');
const Page = require('../models/Page');
const HomaPage = require('../models/HomePage')

const adminPagesConfig = {
    users: { 
        title: 'ניהול משתמשים', 
        tableManager: 'users',
        headers: ["#", "שם משתמש", "אימייל", "סטטוס", "הזמנות", "תפקיד"]
    },
    editScooters: { 
        title: 'עריכת קורקינטים', 
        tableManager: 'scootersTable',
        template: 'admin/editScooters',
        data: async () => await Product.find({ templateType: 'scooter' })
            .select('_id name title variants')
            .lean()
    },
    editProducts: { 
        title: 'עריכת מוצרים', 
        tableManager: 'products',
        headers: ["#", "תמונה", "שם מוצר", "מחיר", "קטגוריה", "סטטוס"]
    },
    manageHomePage: { 

        title: 'ניהול עיצוב דף הבית', 
        data: async () => await HomaPage.findOne()
        .lean(),
        template: 'admin/manageHomePage',
    },
    pages: { 
        title: 'ניהול דפים', 
        tableManager: 'pages',
        headers: ["#", "סלאג", "תוכן", "סטטוס"]
    },
    leads: { 
        title: 'ניהול לידים', 
        tableManager: 'leads',
        headers: ["#", "שם מלא", "אימייל", "טלפון", "סוג פנייה", "תאריך"]
    },
    newsletters: { 
        title: 'ניהול ניוזלטרים', 
        tableManager: 'leads',
        headers: ["#", "שם מלא", "אימייל", "טלפון", "סוג פנייה", "תאריך"]
    },
    abtests: { 
        title: 'ניהול AB Tests', 
        tableManager: 'abtests',
        headers: ["#", "מפתח", "וריאנטים", "סטטוס"]
    },
    coupons: { 
        title: 'ניהול קופונים', 
        tableManager: 'coupons',
        headers: ["#", "שם הקופון", "סוג הקופון", "ערך הנחה", "תוקף", "שימושים", "סטטוס"]
    },
    dealers: { 
        title: 'ניהול מפיצים', 
        tableManager: 'dealers',
        headers: ["#", "שם מפיץ", "אימייל", "טלפון", "סוג", "כתובת"]
    },
    orders: { 
        title: 'ניהול הזמנות', 
        tableManager: 'orders',
        headers: ["#", "שם לקוח", "טלפון", "תאריך הזמנה", "סכום", "סטטוס", "פרטים", "סטטוס טיפול"]
    },
    abandoned: { 
        title: 'סלים נטושים', 
        tableManager: 'abandoned',
        headers: ["#", "שם לקוח", "טלפון", "תאריך הזמנה", "סכום", "סטטוס", "פרטים", "סטטוס טיפול"]
    },
    phonePayment: { 
        title: 'סלים נטושים', 
        tableManager: 'phonePayment',
        headers: ["#", "שם לקוח", "טלפון", "תאריך הזמנה", "סכום", "סטטוס", "פרטים", "סטטוס טיפול"]
    },
    support: { 
        title: 'ניהול הדרכות וידאו', 
        tableManager: 'support',
        headers: ["#", "שם מודל", "לוגו", "כמות סרטונים"]
    },
    blog: { 
        title: 'בלוגים', 
        tableManager: 'blog',
        headers: ["#", "כותרת", "נראות", "מחבר", "קטגוריה", "עדכון"]
    },
    settings: { 
        title: 'הגדרות מערכת',
        template: 'admin/settings',
        data: async () => {
            const settings = await Settings.findOne().lean();
            const redirects = await Redirect.find().sort({ createdAt: -1 }).lean();

            return {
                settings,
                redirects,
                terms: settings?.policies?.termsOfService 
                    ? await Page.findById(settings.policies.termsOfService).lean() 
                    : null,
                privacy: settings?.policies?.privacyPolicy 
                    ? await Page.findById(settings.policies.privacyPolicy).lean() 
                    : null
            };
        }
    }
};

module.exports = adminPagesConfig;
