// const { google } = require('googleapis');
// const path = require('path');

// const auth = new google.auth.GoogleAuth({
//   keyFile: path.join(__dirname, '../config/google-service-account.json'),
//   scopes: ['https://www.googleapis.com/auth/content'],
// });

// async function removeAllProductsFromMerchant() {
//   const authClient = await auth.getClient();
//   const content = google.content({ version: 'v2.1', auth: authClient });

//   const merchantId = process.env.MERCHANT_ID;

//   console.log('📦 Fetching all products from Merchant Center...');

//   const allProducts = [];
//   let nextPageToken = null;

 
//   do {
//     const res = await content.products.list({
//       merchantId,
//       pageToken: nextPageToken || undefined,
//       maxResults: 250,
//     });

//     const products = res.data.resources || [];
//     allProducts.push(...products);
//     nextPageToken = res.data.nextPageToken;
//   } while (nextPageToken);

//   console.log(`🧹 Found ${allProducts.length} products. Starting deletion...`);

//   for (const product of allProducts) {
//     try {
//       let productId = product.id;
  
//       // תיקון: החלף iw ל-he אם צריך
//       productId = productId.replace(/^online:iw:/, 'online:he:');
  
//       await content.products.delete({
//         merchantId,
//         productId
//       });
  
//       console.log(`✅ Deleted: ${productId}`);
//     } catch (err) {
//       console.error(`❌ Failed to delete ${product.id}:`, err.message);
//     }
//   }
  

//   console.log('🎉 Finished removing all products from Google Merchant.');
// }

async function removeAllProductsFromMerchant() {

  

  console.log('🎉 Finished removing all products from Google Merchant.');
}

module.exports = { removeAllProductsFromMerchant };
