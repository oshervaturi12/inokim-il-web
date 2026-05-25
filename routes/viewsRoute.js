const express = require('express')
const authController = require('../controllers/authController')
const viewsController = require('../controllers/viewsController')

const { cachePage } = require('../middlewares/cacheMiddleware');

const router = express.Router()

router.use(authController.isLoggedIn)

// router.get('/test', viewsController.renderHomePageTest)

router.get('/', viewsController.renderHomePage)

router.get('/find-us', viewsController.renderFindUsPage)

router.get('/products/:slug', viewsController.renderProduct)

router.get('/products/:slug/overview', viewsController.renderOverviewProduct)

router.get('/category/:slug', viewsController.renderCategories)

router.get('/sitemap', viewsController.renderSitemap);
router.get('/faq', viewsController.renderFaq);
router.get('/about-inokim', viewsController.renderAboutUs);
router.get('/test-ride', viewsController.renderTestRide);
router.get('/dealers', viewsController.renderDealerContact);
router.get('/trade-in', viewsController.renderTradeIn);
router.get('/support', viewsController.renderSupportPage);
router.get('/support/:slug', viewsController.renderSupportPageModel);


router.get('/login', viewsController.renderLogin);
router.get('/user/settings', authController.protect,  viewsController.renderMySettings);
router.get('/user/warranty',authController.protect, viewsController.renderMyWarranty);
router.get('/account', authController.protect, viewsController.renderMyAcounet);
router.get('/contact-us', viewsController.renderContactUs);
router.get('/blog', viewsController.renderMainBlog);

router.get('/loan', viewsController.renderLoanPage);
router.get('/leads', viewsController.rendeLeadsPage);

router.get('/blog/:slug', viewsController.renderBlogPost);

router.get('/shop', viewsController.renderShopPage)
router.get('/checkout/:cartId', viewsController.renderCheckoutPage)
router.get('/payment/:pageId', viewsController.renderPaymentPage)
router.get('/thank-you/:id', viewsController.renderThankYouPage)

router.get('/pages/:slug', viewsController.renderDynamicPage);

router.get('/test/kix', viewsController.renderTestKix);

router.get('/page/purchase-group', viewsController.renderPurchaseGroup);


module.exports = router;