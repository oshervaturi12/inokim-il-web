const factory = require('./handlerFactory')
const Cart = require('./../models/Cart')
const Product = require('../models/Products');
const Upsell = require('../models/Upsell');
const catchAsync = require('../util/catchAsync')
const Coupon = require('../models/Coupon');
const AppError = require('../util/appError');
const eventEmitter = require('../events');


exports.getAllCarts = factory.getAll(Cart)

exports.createCart = factory.createOne(Cart)

exports.getCart = factory.getOne(Cart)

exports.updateCart = factory.updateOne(Cart)

exports.deleteCart = factory.deleteOne(Cart)




exports.addToCart = catchAsync(async (req, res, next) => {


  if (!req.session) {
    return res.status(500).json({ status: 'error', message: 'Session not initialized' });
  }

  await req.session.save();

  const sessionId = req.session.id;

  const userId = req.user ? req.user._id : null;

  const { items } = req.body;


  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ status: 'error', message: 'Invalid cart data. Expected an items array.' });
  }

  console.log("Incoming Cart Data:", items);

  let cart = await Cart.findOne({ sessionId });
  if (!cart) {
    cart = new Cart({ sessionId, items: [] });
  }


  const variantIds = items.filter(i => !i.isUpsell).map(i => i.variantId);
  const upsellIds = items.filter(i => i.isUpsell).map(i => i.variantId);


  const products = await Product.find({
    $or: [
      { "variants._id": { $in: variantIds } },
      { _id: { $in: variantIds } }
    ]
  }).select("name price variants templateType gallery").lean();


  const upsells = await Upsell.find({
    _id: { $in: upsellIds },
    isActive: true
  }).populate('product', 'name gallery').lean();

  const productMap = new Map();
  products.forEach(product => {
    productMap.set(product._id.toString(), product);
    product.variants.forEach(variant => productMap.set(variant._id.toString(), product));
  });

  const upsellMap = new Map();
  upsells.forEach(upsell => {
    upsellMap.set(upsell._id.toString(), upsell);
  });


  for (const newItem of items) {
    const { variantId, quantity = 1, isUpsell, colorId, colors: colorName, palletImg, suspensions } = newItem;

    if (!variantId) {
      console.warn("⚠️ Skipping item with missing variantId:", newItem);
      continue;
    }


    const finalQuantity = Math.max(quantity, 1);
    let itemName = '';
    let itemPrice = 0;
    let originalPrice = 0;
    let colorData = null;
    let img = "/img/default-product.jpg";
    let sku = '';
    let availability = '';
    let suspensionsVal;

    if (isUpsell) {
      const upsell = upsellMap.get(variantId);
      if (!upsell) {
        console.warn(`⚠️ Upsell not found or inactive: ${variantId}`);
        continue;
      }

      itemName = upsell.customTitle || `${upsell.product.name} - שדרוג`;
      itemPrice = upsell.customPrice || 0;
      img = upsell.customImage || upsell.product.gallery?.[0] || img;
      sku = upsell.sku || '';

    } else {
      const product = productMap.get(variantId);
      if (!product) {
        console.warn(`⚠️ Product not found for variantId: ${variantId}`);
        continue;
      }

      itemName = product.name;
      itemPrice = product.price;
      img = product.gallery?.[0] || img;

        if (palletImg && palletImg !== "" ) {
            img = palletImg || img;
        }

      const selectedVariant = product.variants.find(v => v._id.toString() === variantId);

      if(items[0].colors){
        colorData = { name: items[0].colors, hex: "" };
      }

      if(suspensions) {
        suspensionsVal = suspensions;
      }

      if (selectedVariant) {
        itemName = `${product.name} - ${selectedVariant.subModel}`;
        availability = selectedVariant.availability || '';
        let selectedColor = null;
       
        if (colorId) {
          selectedColor =  selectedVariant.colors.find(c => c._id.toString() === colorId);
        }
        if (selectedColor) {
          itemPrice = selectedColor.price;
          colorData = { name: selectedColor.name, hex: selectedColor.hex };
          sku = selectedColor.sku || '';
          img = selectedColor.image || selectedVariant.gallery?.[0] || product.gallery?.[0] || img;
        } else if (selectedVariant.colors.length > 0) {
          const firstColor = selectedVariant.colors[0] ;
          itemPrice = firstColor.price;
          colorData = { name: firstColor.name, hex: firstColor.hex };
          sku = firstColor.sku || ''; 
        } 
        img = selectedVariant.gallery?.[0] || product.gallery?.[0] || img;
      }
    }


    if (req.noVAT && itemPrice > 0) {
         originalPrice = itemPrice;
        itemPrice = Number((itemPrice / 1.18).toFixed(2));
    }


    const existingItem = cart.items.find(item => item.variantId.toString() === variantId);
    if (existingItem) {
      existingItem.quantity += finalQuantity;
    } else {
      cart.items.push({
        prdName: itemName,
        variantId,
        quantity: finalQuantity,
        price: itemPrice,
        color: colorData,
        img,
        sku,
        originalPrice,
       suspensions: suspensionsVal,
        isUpsell: !!isUpsell,
        availability
      });
    }
  }

  if (cart.isModified("items")) {
    await cart.save();
  }

  console.log(cart)

            eventEmitter.emit("metaEvent", {
              type: "add_to_cart",
              req: req,
              data: {
                url:  `/products/`,
              },
            });

  res.status(200).json({ status: "success", message: "Product(s) added to cart", cart });
});






exports.getMiniCart =  catchAsync( async (req, res, next) => {

    const sessionId = req.sessionID; 
    
    console.log(sessionId)
    // Ensure the user has a session
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID missing' });
    }

    // Fetch cart with only the needed fields
    const cart = await Cart.findOne({ sessionId })
      .populate('coupon', 'discountType discountValue minimumPurchase active expirationDate')
      .lean();

      // console.log(cart)

    if (!cart || !cart.items.length) {
      return res.status(200).json({ success: true, cart: { items: [], totalPrice: 0, discount: 0 } });
    }

    res.status(200).json({
      success: true,
      cart: {
        items: cart.items.map((item) => ({
          id: item.variantId,
          name: item.prdName,
          color: item.color,
          suspensions: item.suspensions,
          quantity: item.quantity,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
           img: item.img
        })),
        totalPrice: cart.totalPrice,
        discount: cart.discount || 0,
        sessionId,
        id: cart._id  
      },
    });
});


// exports.removeItemFromCart = catchAsync( async (req, res) => {

//     const sessionId = req.session.id;
//     if (!sessionId) return res.status(400).json({ success: false, message: 'Session ID missing' });

//     const { id } = req.params;

//     const cart = await Cart.findOneAndUpdate(
//       { sessionId },
//       { $pull: { items: { variantId: id } } },
//       { new: true }
//     ).lean();

//     if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

//     res.status(200).json({ success: true, cart });


// });


exports.removeItemFromCart = catchAsync(async (req, res) => {

  const sessionId = req.session.id;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Session ID missing' });
  }

  const { id } = req.params;

  let cart = await Cart.findOneAndUpdate(
    { sessionId },
    { $pull: { items: { variantId: id } } },
    { new: true }
  );

  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  cart.total = cart.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  cart.totalItems = cart.items.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  await cart.save();

  res.status(200).json({ success: true, cart });

});


exports.getCartCount = catchAsync(async (req, res, next) => {
  const sessionId = req.session.id;

  const cart = await Cart.findOne({ sessionId });

  if (!cart || !cart.items.length) {
    return res.json({ count: 0 });
  }

  // Calculate total quantity of items in the cart
  const totalQuantity = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  res.json({ count: totalQuantity });
});




// exports.applyCoupon = catchAsync(async (req, res, next) => {
//   const { code, cartId } = req.body;

//   if (!code || !cartId) {
//     return res.status(400).json({ message: 'Missing coupon code or cart ID' });
//   }

//   const coupon = await Coupon.findOne({
//     code: code.toUpperCase(),
//     active: true,
//     expirationDate: { $gte: new Date() }
//   });

//   if (!coupon) {
//     return res.status(400).json({ message: 'הקופון לא נמצא או שפג תוקפו' });
//   }

//   const cart = await Cart.findById(cartId);
//   if (!cart) {
//     return res.status(404).json({ message: 'העגלה לא נמצאה' });
//   }

//   // Usage limit
//   if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
//     return res.status(400).json({ message: 'קוד הקופון הגיע למכסת השימוש שלו' });
//   }

//   // Check applicable products
//   // Check applicable products
//   if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
//     const applicableSet = new Set(coupon.applicableProducts.map(id => id.toString()));

//     const variantIds = cart.items.map(i => i.variantId);

//     // Get products that contain any of those variantIds
//     const productsWithVariants = await Product.find({ 'variants._id': { $in: variantIds } })
//       .select('_id variants');

//     // Build a Set of productIds from the cart:
//     const cartProductIds = new Set();

//     for (const item of cart.items) {
//       const idStr = item.variantId.toString();

//       // Check if it's a variant by finding its parent
//       const parentProduct = productsWithVariants.find(p =>
//         p.variants.some(v => v._id.toString() === idStr)
//       );

//       if (parentProduct) {
//         cartProductIds.add(parentProduct._id.toString());
//       } else {
//         // It's a product directly
//         cartProductIds.add(idStr);
//       }
//     }

//     const isApplicable = [...cartProductIds].some(id => applicableSet.has(id));

//     if (!isApplicable) {
//       return res.status(400).json({ message: 'הקופון אינו חל על המוצרים שבסל' });
//     }
//   }


//   // Apply and save
//   cart.coupon = coupon._id;

//   // Recalculate discount
//   let total = 0;
//   cart.items.forEach(item => {
//     total += (item.price || 0) * item.quantity;
//   });

//   if (coupon.type === 'fixed') {
//     const discountAmount = Math.min(coupon.fixedPrice || 0, total);
//     cart.discount = discountAmount;
//     cart.totalPrice = total - discountAmount;
//   }

//   if (coupon.type === 'percentage') {
//   const discountAmount = (total * coupon.discountValue) / 100;

//   cart.discount = discountAmount;
//   cart.totalPrice = total - discountAmount;
// }

//   await cart.save();

//   res.status(200).json({ message: 'קופון הוזן בהצלחה!' , cart});
// });


exports.applyCoupon = catchAsync(async (req, res, next) => {
  const { code, cartId } = req.body;

  if (!code || !cartId) {
    return res.status(400).json({
      message: 'Missing coupon code or cart ID',
    });
  }

  // -----------------------------------------
  // Find coupon
  // -----------------------------------------
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    active: true,
    expirationDate: { $gte: new Date() },
  });

  if (!coupon) {
    return res.status(400).json({
      message: 'הקופון לא נמצא או שפג תוקפו',
    });
  }

  // -----------------------------------------
  // Find cart
  // -----------------------------------------
  const cart = await Cart.findById(cartId);

  if (!cart) {
    return res.status(404).json({
      message: 'העגלה לא נמצאה',
    });
  }

  if (!cart.items || cart.items.length === 0) {
    return res.status(400).json({
      message: 'העגלה ריקה',
    });
  }

  // -----------------------------------------
  // Usage limit
  // -----------------------------------------
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({
      message: 'קוד הקופון הגיע למכסת השימוש שלו',
    });
  }

  // -----------------------------------------
  // Calculate cart total
  // -----------------------------------------
  let total = 0;
  cart.items.forEach((item) => {
    total += (item.price || 0) * item.quantity;
  });

  // -----------------------------------------
  // Minimum purchase check
  // -----------------------------------------
  if (coupon.minimumPurchase && total < coupon.minimumPurchase) {
    return res.status(400).json({
      message: `סכום הקנייה המינימלי לקופון הוא ${coupon.minimumPurchase} ₪`,
    });
  }

  // -----------------------------------------
  // Find applicable products (resolve variantId -> productId)
  // -----------------------------------------
  let eligibleTotal = total;
  const hasProductRestriction =
    coupon.applicableProducts && coupon.applicableProducts.length > 0;

  if (hasProductRestriction) {
    const applicableSet = new Set(
      coupon.applicableProducts.map((id) => id.toString())
    );

    const variantIds = cart.items
      .map((i) => i.variantId)
      .filter(Boolean);

    const productsWithVariants = variantIds.length
      ? await Product.find({
          'variants._id': { $in: variantIds },
        }).select('_id variants')
      : [];

    eligibleTotal = 0;

    for (const item of cart.items) {
      let productId = null;

      // Resolve productId from variantId
      if (item.variantId) {
        const parentProduct = productsWithVariants.find((p) =>
          p.variants.some(
            (v) => v._id.toString() === item.variantId.toString()
          )
        );
        if (parentProduct) {
          productId = parentProduct._id.toString();
        }
      }

      // Fallback: item may store productId directly
      if (!productId && item.productId) {
        productId = item.productId.toString();
      }

      // Count only if this item is in the applicable list
      if (productId && applicableSet.has(productId)) {
        eligibleTotal += (item.price || 0) * item.quantity;
      }
    }

    if (eligibleTotal <= 0) {
      return res.status(400).json({
        message: 'הקופון אינו חל על המוצרים שבסל',
      });
    }
  }

  // -----------------------------------------
  // Apply coupon
  // -----------------------------------------
  cart.coupon = coupon._id;

  let discountAmount = 0;

  if (coupon.type === 'fixed') {
    discountAmount = Math.min(coupon.fixedPrice || 0, eligibleTotal);
    cart.discount = discountAmount;
    cart.totalPrice = total - discountAmount;
  }
  else if (coupon.type === 'percentage') {
    discountAmount =
      (eligibleTotal * (coupon.discountValue || 0)) / 100;
    cart.discount = discountAmount;
    cart.totalPrice = total - discountAmount;
  }
  else if (coupon.type === 'free_shipping') {
    cart.discount = 0;
    cart.totalPrice = total;
    cart.freeShipping = true;
  }
  else {
    return res.status(400).json({
      message: 'סוג קופון לא חוקי',
    });
  }

  // Safety: never go negative
  cart.totalPrice = Math.max(cart.totalPrice, 0);
  cart.discount = Math.max(cart.discount, 0);

  await cart.save();

  res.status(200).json({
    message: 'קופון הוזן בהצלחה!',
    cart,
  });
});

const productIds = [
  "67bf0451135ac53e7d8d1122",
  "67bf0a0c84ff4f0c109b1ff9",
  "67c607e1cd21f0c7bbd4cb15"
];

async function getVariantIdsForProducts() {
  try {

    const products = await Product.find({ _id: { $in: productIds } }).select('name variants');

    const result = products.map(p => ({
      name: p.name,
      productId: p._id,
      variantIds: p.variants.map(v => v._id),
    }));

    console.log('✅ Variant IDs:', JSON.stringify(result, null, 2));

  } catch (err) {
    console.error('❌ Error:', err);

  }
}

// getVariantIdsForProducts();



exports.updateCartPrices = catchAsync( async (req, res, next) => {

    const { cartId, itemIds, newPrices } = req.body;

    if (!cartId || !itemIds || !newPrices) {
      return next(new AppError("Missing data", 400))

    }
  
    const cart = await Cart.findById(cartId);
 
    if (!cart) return next(new AppError("Cart not found", 404))


    const idsArr = Array.isArray(itemIds) ? itemIds : [itemIds];
    const pricesArr = Array.isArray(newPrices) ? newPrices : [newPrices];


    idsArr.forEach((itemId, i) => {

      const item = cart.items.id(itemId) || cart.items.find(it => String(it._id) === String(itemId));
      if (item) {

        item.price = Number(pricesArr[i]) || item.price;
      }
    });

  
      await cart.save();

 
    res.status(201).json({ message: 'המחירים עודכנו בהצלחה!' , cart});

 
});


exports.updateCartForVat = catchAsync(async (req, res) => {
  const sessionId = req.session.id;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Session ID missing' });
  }

  const noVAT = req.noVAT === true;

  let cart = await Cart.findOne({ sessionId });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }


  if (cart.isNoVAT === noVAT) {
    return res.status(200).json({ success: true, message: 'Cart already updated', cart });
  }

  let totalPrice = 0;

  cart.items = cart.items.map(item => {

    if (!item.originalPrice) {
      item.originalPrice = item.price;
    }

    let price = item.originalPrice;

    if (noVAT) {
      price = Number((price / 1.18).toFixed(2));
    }

    item.price = price;
    totalPrice += price * (item.quantity || 1);

    return item;
  });

  cart.totalPrice = totalPrice;
  cart.isNoVAT = noVAT; 

  await cart.save();

  res.status(200).json({ 
    success: true, 
    message: `Cart updated for ${noVAT ? 'Eilat (no VAT)' : 'regular VAT'}`, 
    cart 
  });
});
