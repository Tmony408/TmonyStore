const express = require('express');
const Router = express.Router();
const {createUser, loginControl, getAllUsers, getAUser, deleteAUser, updateAUser, blockUser, unblockUser, handleRefreshToken, logOut, updatePassword, forgotPasswordToken, resetPassword} = require('../controllers/user');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

Router.post('/register', createUser)
Router.post('/login',loginControl )
Router.post('/forgot-password-token' , forgotPasswordToken)
Router.get('/logout', logOut)
Router.get('/get-users',authMiddleware, getAllUsers)
Router.get('/refresh', handleRefreshToken)
Router.get('/:id',authMiddleware, getAUser)
Router.delete('/:id/delete',authMiddleware,isAdmin, deleteAUser)
Router.put('update-password', authMiddleware, updatePassword)
Router.put('/:id/update',authMiddleware,isAdmin, updateAUser)
Router.put('/block-user/:id', authMiddleware, isAdmin, blockUser)
Router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser)
Router.put('/reset-password/:token', resetPassword)
module.exports = Router;