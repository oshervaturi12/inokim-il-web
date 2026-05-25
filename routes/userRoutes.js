
const express = require('express');
const userController = require('./../controllers/userController')
const router = express.Router();
const authController = require('./../controllers/authController')

router.post('/signup', authController.signup)
router.post('/login', authController.login)

router.get('/logout', authController.logout)

 router.use(authController.protect);
router.get('/me', userController.getMe, userController.getUser);

router.post(
    '/create-privileged',
    authController.restricTo('superAdmin'),
    authController.createPrivilegedUser
)

router
    .route('/').get(userController.getAllUsers)
    .post(userController.createUser)
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router;