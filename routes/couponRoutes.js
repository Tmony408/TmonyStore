const express = require('express')
const Router = express.Router();
const {createCoupon, getAllCoupon, updateCoupon, deleteCoupon, getaCoupon, } = require('../controllers/coupon')
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware')

Router.post('', authMiddleware, isAdmin, createCoupon );
Router.get('', authMiddleware, isAdmin, getAllCoupon);
Router.get('/', authMiddleware, isAdmin, getaCoupon);
Router.put('/update', authMiddleware, isAdmin, updateCoupon);
Router.delete('', authMiddleware, isAdmin, deleteCoupon);





module.exports = Router;