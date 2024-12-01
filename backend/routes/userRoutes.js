const express = require('express')
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')
const router = express.Router()

router.post('/register', authController.signup)
router.post('/signin', authController.login)
router.get('/logout', authController.logout)
router.patch('/updatepassword/:id', authController.updatePassword)

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

router
    .post('/send-otp', authController.sendOtp);

router
    .post('/reset-password/:email', authController.forgotPassword);

module.exports = router