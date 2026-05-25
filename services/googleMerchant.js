// const { google } = require('googleapis');
// const path = require('path');

// const auth = new google.auth.GoogleAuth({
//   keyFile: path.join(__dirname, '../config/google-service-account.json'),
//   scopes: ['https://www.googleapis.com/auth/content'],
// });

// async function uploadProduct(product) {
//   const authClient = await auth.getClient();
//   const content = google.content({ version: 'v2.1', auth: authClient });

//   const res = await content.products.insert({
//     merchantId: process.env.MERCHANT_ID, // לדוגמה: 123456789
//     requestBody: {
//       offerId: product.id,
//       title: product.title,
//       description: product.description,
//       link: product.link,
//       imageLink: product.image,
//       contentLanguage: 'he',
//       targetCountry: 'IL',
//       channel: 'online',
//       availability: 'in stock',
//       condition: 'new',
//       price: {
//         value: product.price.toFixed(2),
//         currency: 'ILS',
//       },
//     },
//   });

//   return res.data;
// }


async function uploadProduct(product) {


  return [];
}

module.exports = { uploadProduct };
