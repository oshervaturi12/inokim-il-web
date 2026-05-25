const axios = require('axios');


// Default Values
const DEFAULT_CATEGORY_ID = "67bd69a3c1d73e0a72d9ff92";
const DEFAULT_TEMPLATE_TYPE = "default";

// Shopify API Credentials
const SHOPIFY_URL = process.env.ILURL;
const SHOPIFY_API_KEY = process.env.ILUSERNAME;
const SHOPIFY_PASSWORD = process.env.ILPASSWORD;



/**
 * Fetch all active Shopify products with the tag "PARTS"
 */
async function getAllProducts() {
  try {
    const response = await axios.get(`${SHOPIFY_URL}products.json`, {
      auth: {
        username: SHOPIFY_API_KEY,
        password: SHOPIFY_PASSWORD,
      },
      params: { limit: 250 }, // Shopify allows max 250 per request
    });

    if (!response.data.products) {
      console.error("❌ No products found in response");
      return [];
    }

    // ✅ Filter products with tag 'PARTS' and status 'active'
    return response.data.products.filter(
      (product) => product.tags.includes("PARTS") && product.status === "active"
    );
  } catch (error) {
    console.error("❌ Error fetching products:", error.response ? error.response.data : error.message);
    return [];
  }
}

/**
 * Transform Shopify product format to match MongoDB schema
 */
function transformShopifyProduct(shopifyProduct) {
  return {
    name: shopifyProduct.title || "No Name",
    title: shopifyProduct.title || "No Title",
    description: shopifyProduct.body_html || "",
    overviewImage: shopifyProduct.image?.src || "",
    gallery: Array.isArray(shopifyProduct.images) ? shopifyProduct.images.map(img => img.src) : [],
    slug: shopifyProduct.handle || "",
    price: parseFloat(shopifyProduct.variants?.[0]?.price) || 0,
    compareAtPrice: parseFloat(shopifyProduct.variants?.[0]?.compare_at_price) || 0,
    category: DEFAULT_CATEGORY_ID,
    templateType: DEFAULT_TEMPLATE_TYPE,

    variants: Array.isArray(shopifyProduct.variants)
      ? shopifyProduct.variants.map((variant) => ({
          subModel: variant.title || "Default Variant",
          gallery: [],
          colors: [
            {
              name: variant.option1 || "Default",
              sku: variant.sku || "",
              price: parseFloat(variant.price) || 0,
              compareAtPrice: parseFloat(variant.compare_at_price || 0),
              inventoryQty: variant.inventory_quantity || 0,
              image: shopifyProduct.image?.src || "",
            },
          ],
        }))
      : [],
  };
}

/**
 * Import all filtered Shopify products into MongoDB
 */
async function importShopifyProducts() {
  const shopifyProducts = await getAllProducts();

  if (!shopifyProducts.length) {
    console.log("❌ No products found to import!");
    return;
  }

  const transformedProducts = shopifyProducts.map(transformShopifyProduct);
  // console.log(shopifyProducts[0].variants)

  try {
     const savedProducts = await Product.insertMany(transformedProducts);
     console.log(`✅ Successfully imported ${savedProducts.length} products!`);
  } catch (error) {
    console.error("❌ Error saving products to MongoDB:", error);
  }
}

// Run the import
//  importShopifyProducts();




async function deleteProductsByCategory() {
  try {
    const result = await Product.deleteMany({ category: DEFAULT_CATEGORY_ID });
    console.log(`🗑️ Deleted ${result.deletedCount} products with category ${DEFAULT_CATEGORY_ID}`);
  } catch (error) {
    console.error("❌ Error deleting products:", error);
  }
}

// // Run the function
//  deleteProductsByCategory();


async function removeDuplicateProducts() {
  try {
    console.log("🔍 Checking for duplicate products...");

    // Step 1: Get all products with the specified category
    const products = await Product.find({ category: DEFAULT_CATEGORY_ID }).sort({ createdAt: -1 });

    if (!products.length) {
      console.log("✅ No products found in the specified category.");
      return;
    }

    // Step 2: Identify duplicates based on `slug`
    const uniqueProducts = new Map(); // Store unique products by slug
    const duplicateIds = [];

    for (const product of products) {
      if (!uniqueProducts.has(product.name)) {
        uniqueProducts.set(product.name, product._id); // Store only the latest product ID
      } else {
        duplicateIds.push(product._id); // Mark duplicates for deletion
      }
    }

    // Step 3: Delete duplicate products
    if (duplicateIds.length > 0) {
      const result = await Product.deleteMany({ _id: { $in: duplicateIds } });
      console.log(`🗑️ Removed ${result.deletedCount} duplicate products.`);
    } else {
      console.log("✅ No duplicates found.");
    }
  } catch (error) {
    console.error("❌ Error removing duplicates:", error);
  } 
}
  //  removeDuplicateProducts();




  // const axios = require("axios");
// const SHOPIFY_URL = process.env.ILURL;
// const SHOPIFY_API_KEY = process.env.ILUSERNAME;
// const SHOPIFY_PASSWORD = process.env.ILPASSWORD;

/**
 * 🔥 Fetch all blogs from Shopify
 */
async function getAllBlogs() {
  try {
    let allBlogs = [];
    let nextPageUrl = `${SHOPIFY_URL}blogs.json?limit=250`;

    while (nextPageUrl) {
      const response = await axios.get(nextPageUrl, {
        auth: {
          username: SHOPIFY_API_KEY,
          password: SHOPIFY_PASSWORD,
        },
      });

      if (response.data.blogs.length === 0) break;

      allBlogs = [...allBlogs, ...response.data.blogs];

      // Check for pagination
      nextPageUrl = response.headers["link"]?.includes('rel="next"')
        ? response.headers["link"].match(/<(.*?)>/)[1]
        : null;
    }

    console.log(`✅ Found ${allBlogs.length} blogs.`);
    return allBlogs;
  } catch (error) {
    console.error("❌ Error fetching blogs:", error.response?.data || error.message);
    return [];
  }
}

// Example Usage
// getAllBlogs().then((blogs) => console.log(blogs));



/**
 * 🔥 Fetch all articles from a specific blog (with full content)
 * @param {string} blogId - The ID of the blog
 */
async function getBlogArticles(blogId) {
  try {
    let allArticles = [];
    let nextPageUrl = `${SHOPIFY_URL}blogs/${blogId}/articles.json?limit=250`;

    while (nextPageUrl) {
      const response = await axios.get(nextPageUrl, {
        auth: {
          username: SHOPIFY_API_KEY,
          password: SHOPIFY_PASSWORD,
        },
      });

      if (response.data.articles.length === 0) break;

      allArticles = [...allArticles, ...response.data.articles];

      // Check for pagination
      nextPageUrl = response.headers["link"]?.includes('rel="next"')
        ? response.headers["link"].match(/<(.*?)>/)[1]
        : null;
    }

    console.log(`✅ Found ${allArticles.length} articles in blog ${blogId}.`);
    return allArticles;
  } catch (error) {
    console.error("❌ Error fetching articles:", error.response?.data || error.message);
    return [];
  }
}

// Example Usage (Replace with a valid blog ID)
// getBlogArticles("90517373237").then((articles) => console.log(articles));





const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

function readCsvAndSumNames() {
  return new Promise((resolve, reject) => {
    const nameCounts = {};

    const filePath = path.join(__dirname, '../2023.csv');

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const name = row['שם לקוח'];
        const phone = row['נייד'];
        if (name) {
          if (!nameCounts[name]) {
            nameCounts[name] = { count: 1, phone: phone || '' };
          } else {
            nameCounts[name].count += 1;
          }
        }
      })
      .on('end', () => {
        let csvResult = 'שם לקוח,נייד,סכום פניות\n';
        for (const [name, info] of Object.entries(nameCounts)) {
          csvResult += `${name},${info.phone},${info.count}\n`;
        }

        const csvWithBom = '\uFEFF' + csvResult;

        resolve(csvWithBom);
      })
      .on('error', reject);
  });
}



readCsvAndSumNames()
  .then((csvString) => {
    const outputPath = path.join(__dirname, '../unique_names.csv');
    fs.writeFileSync(outputPath, csvString, { encoding: 'utf8' });
    console.log('CSV file created successfully at', outputPath);
  })
  .catch(console.error);