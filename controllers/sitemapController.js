const path = require('path');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const Page = require('./../models/Page');
const Category = require('../models/Category');
const Product = require('../models/Products');
const Blog = require('../models/Blog');


exports.llmsTxt = (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(path.join(__dirname, '../public/llms.txt'));
};

// ─── Sitemap index ────────────────────────────────────────────────────────────

exports.sitemapIndex = (req, res) => {
  const siteUrl = 'https://il.inokim.com';

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
      <loc>${siteUrl}/sitemaps/pages.xml</loc>
    </sitemap>
    <sitemap>
      <loc>${siteUrl}/sitemaps/categories.xml</loc>
    </sitemap>
    <sitemap>
      <loc>${siteUrl}/sitemaps/products.xml</loc>
    </sitemap>
    <sitemap>
      <loc>${siteUrl}/sitemaps/blogs.xml</loc>
    </sitemap>
  </sitemapindex>`;

  res.header('Content-Type', 'application/xml');
  res.send(sitemapXml);
};

// ─── Blogs sitemap ────────────────────────────────────────────────────────────

exports.blogsSitemap = catchAsync(async (req, res) => {
  const siteUrl = 'https://il.inokim.com';
  const blogs = await Blog.find({ isPublished: true }).select('slug updatedAt');

  const urls = blogs.map(blog => `
    <url>
      <loc>${siteUrl}/blog/${blog.slug}</loc>
      <lastmod>${blog.updatedAt.toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join('\n')}
  </urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// ─── Pages sitemap ────────────────────────────────────────────────────────────

exports.pagesSitemap = catchAsync(async (req, res) => {
  const siteUrl = 'https://il.inokim.com';
  const pages = await Page.find({ published: true }).select('slug updatedAt');

  const staticUrls = [
    { loc: `${siteUrl}/`,          changefreq: 'weekly',  priority: 1.0 },
    { loc: `${siteUrl}/shop`,      changefreq: 'weekly',  priority: 0.9 },
    { loc: `${siteUrl}/find-us`,   changefreq: 'weekly',  priority: 0.9 },
    { loc: `${siteUrl}/support`,   changefreq: 'weekly',  priority: 0.9 },
    { loc: `${siteUrl}/contact-us`,changefreq: 'weekly',  priority: 0.9 },
    { loc: `${siteUrl}/test-ride`, changefreq: 'weekly',  priority: 0.9 },
    { loc: `${siteUrl}/trade-in`,  changefreq: 'monthly', priority: 0.8 },
    { loc: `${siteUrl}/loan`,      changefreq: 'monthly', priority: 0.7 },
    { loc: `${siteUrl}/llms.txt`,  changefreq: 'monthly', priority: 0.5 },
  ];

  const dynamicUrls = pages.map(page => ({
    loc: `${siteUrl}/pages/${page.slug}`,
    lastmod: page.updatedAt?.toISOString(),
    changefreq: 'monthly',
    priority: 0.8,
  }));

  const allUrls = [...staticUrls, ...dynamicUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allUrls.map(url => `
      <url>
        <loc>${url.loc}</loc>
        ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
      </url>
    `).join('')}
  </urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// ─── Categories sitemap ───────────────────────────────────────────────────────

exports.categoriesSitemap = catchAsync(async (req, res) => {
  const siteUrl = 'https://il.inokim.com';
  const categories = await Category.find({}).select('slug updatedAt');

  const urls = categories.map(category => `
    <url>
      <loc>${siteUrl}/category/${category.slug}</loc>
      <lastmod>${category.updatedAt.toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join('\n')}
  </urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// ─── Products sitemap ─────────────────────────────────────────────────────────

exports.productsSitemap = catchAsync(async (req, res) => {
  const siteUrl = 'https://il.inokim.com';
  const products = await Product.find({ status: 'active' }).select('slug updatedAt templateType');

  const urls = [];

  for (const product of products) {
    if (!product.slug) continue;

    // Main product/purchase page
    urls.push(`
      <url>
        <loc>${siteUrl}/products/${product.slug}</loc>
        <lastmod>${product.updatedAt.toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
      </url>`);

    // Overview page — scooter template only
    if (product.templateType === 'scooter') {
      urls.push(`
        <url>
          <loc>${siteUrl}/products/${product.slug}/overview</loc>
          <lastmod>${product.updatedAt.toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.85</priority>
        </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join('\n')}
  </urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});