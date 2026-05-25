
const express = require('express');
const homePgaeController = require('./../controllers/homePageController')
const router = express.Router();
const authController = require('./../controllers/authController')

router.use(authController.isLoggedIn)


router
    .route('/')
    .get(authController.protect, authController.restricTo('admin'),homePgaeController.getAllHomaPages)
    .post(authController.protect, authController.restricTo('admin'),homePgaeController.createHomaPage)
router
    .route('/:id')
    .get(homePgaeController.getHomaPage)
    .patch(authController.protect, authController.restricTo('admin'),homePgaeController.updateHomaPage)
    .delete(authController.protect, authController.restricTo('admin'),homePgaeController.deleteHomaPage)

module.exports = router;