const catchAsync = require('../util/catchAsync')
const AppError = require('../util/appError');
const User = require('../models/User');
const Product = require('../models/Products')
const Coupon = require('../models/Coupon')
const Order = require('../models/Order')
const ContactForm = require('../models/ContactForm')
const Location = require('../models/Location')
const Tracker = require('../models/Tracker');
const Blog = require('../models/Blog')
const Page = require('../models/Page')
const VideoSupport = require('../models/VideoSupport')
const {rolesConfig} = require('./authController')
const adminPagesConfig = require('./../config/adminPagesConfig');
const {formatter} = require('./helpers')
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const { async } = require('regenerator-runtime');
const { getActiveCampaigns } = require('../services/googleAdsService');
const ABTests = require('../models/ABTests')
const AIInsight = require('../models/AIInsight');
const s3path = process.env.S3PATH

moment.locale('he');

const orderStatus = {
    "processing": "בטיפול",
    "shipped": "נשלח",
    "delivered": "נמסר",
    "cancelled": "בוטל"
}

const paymnetStatus = {
    "pending": "ממתין לתשלום",
    "paid": "שולם",
    "failed": "נכשל",
    "refunded": "החזר"
}



const getSessionCount = async () => {
  const sessionCollection = mongoose.connection.collection('sessions');
  const count = await sessionCollection.countDocuments({});
  return count;
};

const getMonthlySales = async () => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const result = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    return result[0]?.total || 0;
  };
  

  const getMonthlyScootersSold = async () => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const result = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'paid' } },
      { $unwind: "$items" },
      { $group: { _id: null, total: { $sum: "$items.quantity" } } }
    ]);
    return result[0]?.total || 0;
  };
  
  const getTopPages = async () => {
    const rawPages = await Tracker.aggregate([
      { $unwind: '$actions' },
      { $match: { 'actions.type': 'page_view' } },
      {
        $group: {
          _id: '$actions.pageUrl',
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 50 }
    ]);
  
    // Normalize to path, exclude localhost, and fix common typos
    const combinedViews = {};
  
    rawPages.forEach(({ _id, views }) => {
      if (!_id || _id.includes('localhost')) return;
  
      let path;
      try {
        const url = new URL(_id);
        path = url.pathname || '/';
      } catch {
        path = '/';
      }
  
      const decodedPath = decodeURIComponent(path);
      const finalPath = decodedPath === '/fins-us' ? '/find-us' : decodedPath;

      // Fix common typos or aliases
      if (path === '/fins-us') path = '/find-us';
  
      if (combinedViews[finalPath]) {
        combinedViews[finalPath] += views;
      } else {
        combinedViews[finalPath] = views;
      }
    });
  
    // Convert to array
    const topPages = Object.entries(combinedViews).map(([path, views]) => ({
      path,
      views
    }));
  
    // Sort by views
    return topPages.sort((a, b) => b.views - a.views);
  };

  const getBusinessDaysFromNow = (days) => {
    let date = moment.tz('Asia/Jerusalem');
    let added = 0;
  
    while (added < days) {
      date = date.add(1, 'days');
      const day = date.day();
      if (day !== 5 && day !== 6) { // 5 = Friday, 6 = Saturday
        added++;
      }
    }
  
    return date.format('dddd, D [ב]MMMM YYYY'); // בעברית (אם מותקן moment-he)
  };


  const calculateEstimatedDelivery = (order) => {
    const deliveryDays = order.items
      .map(item => {
        const match = item.availability?.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
  
    const maxDays = Math.max(...deliveryDays);
    return getBusinessDaysFromNow(maxDays);
  };

exports.renderAdminDashboard = catchAsync(async (req, res, next) => {


    const [sessions, monthlySales, scootersSold, topPages] = await Promise.all([
        getSessionCount(),
        getMonthlySales(),
        getMonthlyScootersSold(),
        getTopPages()
      ]);

    

    res.render('admin/dashboard', {
        title: 'ניהול מערכת - דשבורד',
        activePage: 'dashboard',
        active: "/admin/dashboard",
        formatter,
        stats: {
            sessions,
            monthlySales,
            scootersSold,
            topPages
          }
    });
});





exports.renderAdminPage = catchAsync(async (req, res, next) => {
    const { page } = req.params;
    const config = adminPagesConfig[page];

    if (!config) {
        return next(new AppError('עמוד לא נמצא', 404));
    }

    // Fetch dynamic data if needed
    const dynamicData = config.data ? await config.data() : null;

    // Render page with dynamic content
    res.render(config.template || 'admin/template', { 
        title: config.title,
        active: `/admin/${page}`,
        tableManager: config.tableManager,
        headers: config.headers,
        data: dynamicData
    });
});




exports.renderAnalytics = catchAsync(async (req, res, next) => {
    // Total Orders
    const totalOrders = await Order.countDocuments();
    
    // Total Revenue (Only Paid Orders)
    const totalRevenue = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    
    // Total Users Registered
    const totalUsers = await User.countDocuments();

    // Total Coupons Used
    const totalCouponsUsed = await Order.countDocuments({ coupon: { $ne: null } });

    // Best Selling Products
    const bestSellingProducts = await Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.prdName", totalSold: { $sum: "$items.quantity" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
    ]);

    // Sales in Last 7 Days
    const last7DaysSales = await Order.aggregate([
        { 
            $match: { 
                paymentStatus: 'paid',
                createdAt: { $gte: moment().subtract(7, 'days').toDate() }
            }
        },
        { 
            $group: { 
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalSales: { $sum: "$totalPrice" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.render('admin/analytics', {
        title: 'אנליטיקות ודוחות',
        activePage: 'analytics',
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalUsers,
        totalCouponsUsed,
        bestSellingProducts,
        last7DaysSales
    });
});


/** ===============================
 *  RENDER INNER ORDER DETAILS PAGE
 * ============================== */


exports.renderOrderDetails = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id).lean();
    
    if (!order) return next(new AppError('הזמנה לא נמצאה', 404));

    const estimatedDelivery = calculateEstimatedDelivery(order);

    res.render('admin/orderDetails', {
        title: `פרטי הזמנה #${order._id.toString().slice(0, 5)}`,
        active: "/admin/orders",
        order,
        formatter,
        orderStatus,
        paymnetStatus,
        estimatedDelivery,
        s3path
    });
});

/** ===============================
 * 📌 RENDER INNER PRODUCT DETAILS PAGE
 * ============================== */
exports.renderProductDetails = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id).lean();
    
    if (!product) return next(new AppError('מוצר לא נמצא', 404));

    res.render('admin/productDetails', {
        title: `עריכת מוצר: ${product.name}`,
        active: "/editProducts",
        product
    });
});


/** ===============================
 * 📌 RENDER INNER SCOOTER DETAILS PAGE
 * ============================== */
exports.renderScooterDetails = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const scooter = await Product.findById(id)
    .populate('seo')
    .populate('variants.pickupLocations')
    .lean();
    
    if (!scooter) return next(new AppError('קורקינט לא נמצא', 404));

    res.render('admin/editScooterPage', {
        title: `עריכת קורקינט: ${scooter.name}`,
        active: "/editScooterPage",
        scooter
    });
});

/** ===============================
 * 📌 RENDER INNER USER DETAILS PAGE
 * ============================== */
exports.renderUserDetails = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).lean();
    const orders = await Order.find({userId: user._id})
    
    if (!user) return next(new AppError('משתמש לא נמצא', 404));

    res.render('admin/userDetails', {
        title: `ניהול משתמש: ${user.name}`,
        active: "/admin/users",
        user,
        orders,
        tickets: []
    });
});

/** ===============================
 * 📌 RENDER INNER LEAD DETAILS PAGE
 * ============================== */
exports.renderLeadDetails = catchAsync(async (req, res, next) => {
    const lead = await ContactForm.findById(req.params.id).lean();
    console.log(lead)
    
    if (!lead) return next(new AppError('ליד לא נמצא', 404));

    res.render('admin/leadDetails', {
        title: `פרטי ליד`,
        active: "/leads",
        lead
    });
});

/** ===============================
 * 📌 RENDER INNER COUPON DETAILS PAGE
 * ============================== */
exports.renderCouponDetails = catchAsync(async (req, res, next) => {
    const coupon = await Coupon.findById(req.params.id).lean();
    
    if (!coupon) return next(new AppError('קופון לא נמצא', 404));

    res.render('admin/couponDetails', {
        title: `עריכת קופון: ${coupon.code}`,
        active: "/coupons",
        coupon
    });
});

/** ===============================
 * 📌 RENDER INNER DEALER DETAILS PAGE
 * ============================== */
exports.renderDealerDetails = catchAsync(async (req, res, next) => {
    const dealer = await Location.findById(req.params.id).lean();
    
    if (!dealer) return next(new AppError('מפיץ לא נמצא', 404));

    res.render('admin/dealerDetails', {
        title: `עריכת מפיץ: ${dealer.name}`,
        active: "/dealers",
        dealer
    });
});


exports.renderFaqEditor = async (req, res, next) => {
  const { pageId } = req.params;

  const page = await Page.findById(pageId);
  if (!page) return next(new AppError('Page not found', 404));


  const block = page.contentBlocks;

  console.log(block)

  if (!block) {
    return next(new AppError('FAQ block not found in this page', 404));
  }


  res.render('admin/pages/faq-inner', {
    title: `עריכת שאלות ותשובות`,
    active: `/admin/pages/${page.slug}`,
    page,
    block
  });
};


exports.renderVideoDetails = catchAsync(async (req, res, next) => {
  const videoSupport = await VideoSupport.findById(req.params.id).lean();
  
  if (!videoSupport) return next(new AppError('וידאו לא נמצא', 404));

  res.render('admin/videoSupport', {
      title: `עריכה`,
      active: "/support",
      videoSupport
  });
});

exports.renderBlogDetails = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id).lean();
  
  if (!blog) return next(new AppError('בלוג לא נמצא', 404));

  res.render('admin/blogDeatails', {
      title: `עריכה`,
      active: "/blog",
      blog
  });
});



exports.renderGoogleAdsDashboard = catchAsync(async (req, res, next) => {
  const campaigns = await getActiveCampaigns(); // מחזיר את המערך

  // Aggregation
  let totalClicks = 0;
  let totalImpressions = 0;
  let totalCostMicros = 0;

  for (const item of campaigns) {
    totalClicks += item.metrics.clicks || 0;
    totalImpressions += item.metrics.impressions || 0;
    totalCostMicros += item.metrics.cost_micros || 0;
  }

  const totalCost = totalCostMicros / 1_000_000; // הופך למטבע רגיל
  const averageCPC = totalClicks > 0 ? totalCost / totalClicks : 0;

  res.render('admin/ads', {
    title: `קמפיינים`,
    active: "/ads",
    campaigns: campaigns,
    formatter,
    stats: {
      clicks: totalClicks,
      impressions: totalImpressions,
      cost: totalCost.toFixed(2),
      averageCPC: averageCPC.toFixed(2),
    }
  });
});









exports.renderABTestInsights = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const test = await ABTests.findById(id).lean();
  if (!test) return next(new AppError('מבחן A/B לא נמצא', 404));

  // Try DB first (or refresh)
  const [dbAb, dbUser, dbCombined, site] = await Promise.all([
      AIInsight.findOne({ test: id, source: 'ab_test' }).lean(),
      AIInsight.findOne({ test: id, source: 'tracker' }).lean(),
      AIInsight.findOne({ test: id, source: 'combined' }).lean(),
      AIInsight.findOne({ type: "html_analysis" }).lean(),
  ]);

  let insight = dbAb?.response || null;
  let insight1 = dbUser?.response || null;
  let combinedInsight = dbCombined?.response || null;
  let siteInsight = site?.response || null;

  res.render('admin/abTestInsights', {
    title: `תובנות A/B`,
    active: "/admin/abtests",
    tests: test,
    insight,
    insight1,
    combinedInsight,
    siteInsight
  });
});
