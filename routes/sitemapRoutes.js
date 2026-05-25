const express = require('express');
const router = express.Router();
const sitemapController = require('../controllers/sitemapController');

router.get('/llms.txt', sitemapController.llmsTxt);
router.get('/sitemap.xml', sitemapController.sitemapIndex);
router.get('/sitemaps/pages.xml', sitemapController.pagesSitemap);
router.get('/sitemaps/categories.xml', sitemapController.categoriesSitemap);
router.get('/sitemaps/products.xml', sitemapController.productsSitemap);
router.get('/sitemaps/blogs.xml', sitemapController.blogsSitemap);

module.exports = router;