
const express = require('express');
const contactFormContrroler = require('./../controllers/contactFormControler')
const router = express.Router();
const authController = require('./../controllers/authController')


router
    .route('/')
    .get(authController.protect, authController.restricTo('admin'),contactFormContrroler.getAllContactForms)
    .post(contactFormContrroler.createContactForm)
router
    .route('/:id')
    .get(authController.protect, authController.restricTo('admin'),contactFormContrroler.getContactForm)
    .patch(authController.protect, authController.restricTo('admin'),contactFormContrroler.updateContactForm)
    .delete(authController.protect, authController.restricTo('admin'),contactFormContrroler.deleteContactForm)

module.exports = router;