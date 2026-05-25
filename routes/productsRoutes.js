
const express = require('express');
const productController = require('./../controllers/productCrontroller')
const router = express.Router();
const authController = require('./../controllers/authController')

router.put('/:productId/variant/:subModel/gallery',authController.protect, authController.restricTo('admin'), productController.updateVariantGallery)
router.post("/updateScooter/:id",authController.protect, authController.restricTo('admin'),productController.updateScooter);

router.post('/upload-product',authController.protect, authController.restricTo('admin'), productController.updateGoogleMerchant)
router.post('/remove-product',authController.protect, authController.restricTo('admin'), productController.clearGoogleMerchant)

router
    .route('/')
    .get(productController.getAllProducts)
    .post(authController.protect, authController.restricTo('admin'),productController.createProduct)
router
    .route('/:id')
    .get(authController.protect, authController.restricTo('admin'),productController.getProduct)
    .patch(authController.protect, authController.restricTo('admin'),productController.updateProduct)
    .delete(authController.protect, authController.restricTo('admin'),productController.deleteProduct)

module.exports = router;