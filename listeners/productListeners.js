// const productEvents = require('../events/productEvents');
const eventEmitter = require('../events'); 
const Product = require('../models/Products');
const Seo = require('../models/Seo');

const generateSeoData = async (product) => {
  if (!product || !product.name || !product.title) {
    console.error("❌ Missing product data for SEO generation.");
    return;
  }

  const baseUrl = "https://il.inokim.com";
  const productUrl = `${baseUrl}/products/${encodeURIComponent(product.slug)}`;

  const variants = product.variants || [];
  const variantNames = variants.map(v => v.subModel).join(", ");
  const availabilityText = variants.map(v => `${v.subModel}: ${v.availability || 'N/A'}`).join("; ");

  const metaDescription = `${product.title} - ${product.overviewSubtitle || ''}. דגמים זמינים: ${variantNames}. זמינות: ${availabilityText}.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.title,
    "image": `${baseUrl}${product.overviewImage || ''}`,
    "brand": {
      "@type": "Brand",
      "name": "Inokim"
    },
    "offers": variants.map(variant => ({
      "@type": "Offer",
      "priceCurrency": "ILS",
      "availability": "https://schema.org/InStock",
      "price": variant.colors?.[0]?.price || "N/A",
      "url": productUrl,
      "itemCondition": "https://schema.org/NewCondition"
    }))
  };

  try {
    const seoData = await Seo.create({
      pageTitle: `${product.name} - קורקינט חשמלי איכותי | INOKIM`,
      metaDescription,
      urlHandle: `/products/${product.slug}`,
      canonicalUrl: productUrl,
      ogTitle: product.title,
      ogDescription: metaDescription,
      ogImage: `${baseUrl}${product.overviewImage || ''}`,
      twitterTitle: product.title,
      twitterDescription: metaDescription,
      twitterImage: `${baseUrl}${product.overviewImage || ''}`,
      jsonLd,
      noIndex: false
    });

    await Product.findByIdAndUpdate(product._id, { seo: seoData._id });

    console.log(`✅ SEO created successfully for product: ${product.name}`);
  } catch (error) {
    console.error(`❌ Error generating SEO for product ${product.name}:`, error);
  }
};

// 🛠️ Listen for product creation event
eventEmitter.on('productCreated', async (product) => {
  await generateSeoData(product);
});

console.log("✅ Product event listener is running...");
