
// const Product = require('../models/Products'); // adjust path as needed


// (async () => {

//   const orders = await Order.find({});
//   let updatedCount = 0;

//   for (const order of orders) {
//     let changed = false;

//     for (const item of order.items) {
//       if (!item.variantId || !item.color?.name) continue;

//       const product = await Product.findOne({ 'variants._id': item.variantId });
//       if (!product) continue;

//       const variant = product.variants.id(item.variantId);
//       if (!variant) continue;

//       const matchedColor = variant.colors.find(c => c.name === item.color.name);
//       if (matchedColor && matchedColor.sku && item.sku !== matchedColor.sku) {
//         item.sku = matchedColor.sku;
//         changed = true;
//       }
//     }

//     if (changed) {
//       //  await order.save();
//       updatedCount++;
//     }
//   }

//   console.log(`✅ Updated ${updatedCount} orders`);

// })();
