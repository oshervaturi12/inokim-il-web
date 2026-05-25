const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restricTo } = require('../controllers/authController');

// Protect all admin routes and restrict to admin role
router.use(protect, restricTo('admin', 'superadmin'));

// Dashboard
router.get('/ads', adminController.renderGoogleAdsDashboard);
router.get('/dashboard', adminController.renderAdminDashboard);




router.get('/:page',adminController.renderAdminPage);


// Analytics Dashboard
router.get('/analytics', adminController.renderAnalytics);


// 🔹 Orders
router.get('/orders/:id', adminController.renderOrderDetails);

// 🔹 Products
router.get('/products/:id', adminController.renderProductDetails);

// 🔹 Scooters
router.get('/scooters/:id', adminController.renderScooterDetails);

// 🔹 Users
router.get('/users/:id', adminController.renderUserDetails);

// 🔹 Leads
router.get('/leads/:id', adminController.renderLeadDetails);

// 🔹 Coupons
router.get('/coupons/:id', adminController.renderCouponDetails);

// 🔹 Dealers
router.get('/dealers/:id', adminController.renderDealerDetails);

router.get('/support/:id', adminController.renderVideoDetails);

router.get('/blog/:id', adminController.renderBlogDetails);

router.get('/pages/:pageId', adminController.renderFaqEditor);

router.get('/abtest/:id', adminController.renderABTestInsights);



module.exports = router;
