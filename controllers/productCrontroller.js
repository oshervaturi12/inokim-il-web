const factory = require('./handlerFactory')
const Product = require('../models/Products');
const catchAsync = require('../util/catchAsync');
const eventEmitter = require('../events'); 
const { uploadProduct } = require('../services/googleMerchant');
const { removeAllProductsFromMerchant } = require('../services/removeAllProductsService');


exports.getAllProducts = factory.getAll(Product, ['title', 'name'])

// exports.createProduct = factory.createOne(Product)
exports.createProduct = catchAsync( async (req, res, next) => {

    const newProduct = factory.createOne(Product)(req, res, next);

    // Emit an event to generate SEO asynchronously
    eventEmitter.emit('productCreated', newProduct);

    return newProduct;
  
});

exports.getProduct = factory.getOne(Product)

exports.updateProduct = factory.updateOne(Product)

exports.deleteProduct = factory.deleteOne(Product)



// ✅ Update Variant Gallery
exports.updateVariantGallery = async (req, res) => {
  const { productId, subModel } = req.params;
  const { newGallery } = req.body; // Expects an array of image URLs

  try {
    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: productId,
        'variants.subModel': subModel
      },
      {
        $set: {
          'variants.$.gallery': newGallery
        }
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product or variant not found.' });
    }

    res.status(200).json({ message: 'Gallery updated successfully', updatedProduct });
  } catch (error) {
    console.error('Error updating gallery:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ➕ Add Image to Variant Gallery
exports.addImageToVariantGallery = async (req, res) => {
  const { productId, subModel } = req.params;
  const { imageUrl } = req.body;

  try {
    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: productId,
        'variants.subModel': subModel
      },
      {
        $push: {
          'variants.$.gallery': imageUrl
        }
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product or variant not found.' });
    }

    res.status(200).json({ message: 'Image added successfully', updatedProduct });
  } catch (error) {
    console.error('Error adding image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ❌ Remove Image from Variant Gallery
exports.removeImageFromVariantGallery = async (req, res) => {
  const { productId, subModel } = req.params;
  const { imageUrl } = req.body;

  try {
    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: productId,
        'variants.subModel': subModel
      },
      {
        $pull: {
          'variants.$.gallery': imageUrl
        }
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product or variant not found.' });
    }

    res.status(200).json({ message: 'Image removed successfully', updatedProduct });
  } catch (error) {
    console.error('Error removing image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔍 Get Variant Gallery
exports.getVariantGallery = async (req, res) => {
  const { productId, subModel } = req.params;

  try {
    const product = await Product.findOne({
      _id: productId,
      'variants.subModel': subModel
    });

    if (!product) {
      return res.status(404).json({ message: 'Product or variant not found.' });
    }

    const variant = product.variants.find((v) => v.subModel === subModel);

    if (!variant) {
      return res.status(404).json({ message: 'Variant not found.' });
    }

    res.status(200).json({ gallery: variant.gallery || [] });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.updateScooter = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        console.log(updateData)

        let scooter = await Product.findById(id);
        if (!scooter) {
            return res.status(404).json({ success: false, message: "Scooter not found" });
        }

        // ✅ General Details Update
        scooter.name = updateData.name || scooter.name;
        scooter.description = updateData.description || scooter.description;
        scooter.overviewSubtitle = updateData.overviewSubtitle || scooter.overviewSubtitle;
        scooter.overviewImage = updateData.overviewImage || scooter.overviewImage;
        scooter.paymentInfoImage = updateData.paymentInfoImage || scooter.paymentInfoImage;
        scooter.overviewVideo = updateData.overviewVideo || scooter.overviewVideo;
        scooter.logoSvg = updateData.logoSvg || scooter.logoSvg;

        // ✅ Variants Update (Preserve existing & add new)
        if (updateData.variants) {
            const updatedVariants = updateData.variants.map(variantData => {
                const existingVariant = scooter.variants.find(v => v._id == variantData._id);

                if (existingVariant) {
                    // Update existing variant
                    existingVariant.subModel = variantData.subModel || existingVariant.subModel;
                    existingVariant.range = variantData.range || existingVariant.range;
                    existingVariant.battary = variantData.battary || existingVariant.battary;
                    existingVariant.availability = variantData.availability || existingVariant.availability;
                    existingVariant.pickupLocations = variantData.pickupLocations || existingVariant.pickupLocations;
                    
                    // ✅ Update Gallery
                    existingVariant.gallery = variantData.gallery || existingVariant.gallery;

                    // ✅ Update Colors (Preserve existing & add new)
                    existingVariant.colors = variantData.colors.map(colorData => {
                        const existingColor = existingVariant.colors.find(c => c._id == colorData._id);
                        return existingColor ? {
                            ...existingColor.toObject(),
                            ...colorData // Update fields
                        } : colorData; // Add new color
                    });

                    return existingVariant;
                } else {
                    // New Variant
                    return variantData;
                }
            });

            scooter.variants = updatedVariants;
        }

        // ✅ Specs Update (Preserve existing & add new)
        if (updateData.specs) {
            const updatedSpecs = updateData.specs.map(specData => {
                const existingSpec = scooter.specs.find(s => s._id == specData._id);
                if (existingSpec) {
                    // Update existing spec category
                    existingSpec.category = specData.category || existingSpec.category;
                    existingSpec.image = specData.image || existingSpec.image;

                    // ✅ Update Spec Items
                    existingSpec.items = specData.items.map(itemData => {
                        const existingItem = existingSpec.items.find(i => i._id == itemData._id);
                        return existingItem ? {
                            ...existingItem.toObject(),
                            ...itemData // Update fields
                        } : itemData; // Add new item
                    });

                    return existingSpec;
                } else {
                    return specData; // Add new spec category
                }
            });

            scooter.specs = updatedSpecs;
        }

        // ✅ Upsell Update (if provided)
        if (updateData.upsell) {
            scooter.upsell = updateData.upsell;
        }

        // ✅ Save updated scooter
        await scooter.save();

        return res.status(200).json({ success: true, message: "Scooter updated successfully", scooter });

    } catch (error) {
        console.error("Update Scooter Error:", error);
        res.status(500).json({ success: false, message: "Server error, please try again" });
    }
};



exports.updateGoogleMerchant = catchAsync(async (req, res, next) => {
  const products = await Product.find({ status: 'active' });

  const uploaded = [];

  for (const product of products) {
    const firstVariant = product.variants?.[0];
    const firstColor = firstVariant?.colors?.[0];

    const imageLink = firstVariant?.gallery?.[0] || product.gallery?.[0];
    const absoluteImage = imageLink?.startsWith('http') 
      ? imageLink 
      : `https://il.inokim.com${imageLink}`;

    const productData = {
      id: product.slug, 
      title: product.name,
      description: product.description || product.title,
      link: `https://il.inokim.com/products/${product.slug}`,
      image: absoluteImage,
      price: firstColor?.price || product.price || 0,
    
    };

    try {
      const result = await uploadProduct(productData);
      uploaded.push(result);
      await Product.findByIdAndUpdate(product._id, {
        $set: {
          'googleMerchant.uploaded': true,
          'googleMerchant.uploadedAt': new Date(),
          'googleMerchant.lastStatus': 'success'
        }
      });
    } catch (err) {
      console.error(`❌ Failed to upload ${productData.id}:`, err.message);
      await Product.findByIdAndUpdate(product._id, {
        $set: {
          'googleMerchant.uploaded': false,
          'googleMerchant.lastStatus': `error: ${err.message}`
        }
      });
    }
  }

  res.status(200).json({
    status: 'success',
    message: `${uploaded.length} products uploaded to Google Merchant`,
    data: uploaded,
  });
});

exports.clearGoogleMerchant = catchAsync(async (req, res, next) => {
  await removeAllProductsFromMerchant();

  res.status(200).json({
    status: 'success',
    message: 'All products removed from Google Merchant',
  });
});
