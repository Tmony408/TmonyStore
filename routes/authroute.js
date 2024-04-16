const express = require('express');
const Router = express.Router();
const {createUser, loginControl, getAllUsers, getAUser, deleteAUser, updateAUser, blockUser, unblockUser, handleRefreshToken, logOut, updatePassword, forgotPasswordToken, resetPassword, adminLogin, getWishList, addAddress, userCart, getUserCart, emptyUserCart, applyCoupon, createOrder, getOrders, updateOrderStatus} = require('../controllers/user');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

Router.post('/register', createUser)
Router.post('/login',loginControl )
Router.post('/admin-login', adminLogin)
Router.post('/forgot-password-token' , forgotPasswordToken) 
Router.post('/cart',authMiddleware, userCart)
Router.post('/cart/order', authMiddleware, createOrder)
Router.post('/get-users/:id',authMiddleware,isAdmin, getAllUsers)
Router.get('/logout', logOut)

Router.get('/get-orders', authMiddleware, getOrders)
Router.get('/refresh', handleRefreshToken)
Router.get('/wishlist', authMiddleware, getWishList)
Router.get('/get-user-cart', authMiddleware, getUserCart)
Router.get('/:id',authMiddleware,isAdmin, getAUser)
Router.delete('/:id/delete',authMiddleware,isAdmin, deleteAUser)
Router.delete('/empty-cart', authMiddleware, emptyUserCart)
Router.put('update-password', authMiddleware, updatePassword)
Router.put('/update-order/:id', authMiddleware, isAdmin, updateOrderStatus)
Router.put('save-address', authMiddleware, addAddress)
Router.put('/:id/update',authMiddleware,isAdmin, updateAUser)
Router.put('/block-user/:id', authMiddleware, isAdmin, blockUser)
Router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser)
Router.put('/cart/coupon', authMiddleware, applyCoupon)
Router.put('/reset-password/:token', resetPassword)
module.exports = Router;