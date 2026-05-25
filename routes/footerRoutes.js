
const express = require('express');
const footerController = require('../controllers/footerController')
const router = express.Router();
const authController = require('../controllers/authController')



router
    .route('/')
    .post(footerController.createFooter)
router
    .route('/:id')
    .get(footerController.getFooter)
    .patch(footerController.updateFooter)
    .delete(footerController.deleteFooter)

module.exports = router;