const Coupon = require('../models/coupon')
const asyncHandler = require('express-async-handler')
const validateMongoDbId = require('../utils/validateMongodbId')


const createCoupon = asyncHandler(async(req,res) =>{
    try {
        const newCoupon = await Coupon.create(req.body);
        res.json(newCoupon);
    } catch (error) {
        throw new Error(error)
    }
})

const updateCoupon = asyncHandler(async(req,res) =>{
    const {id} = req.params
    validateMongoDbId(id)
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
            new:true
        });
        res.json(updatedCoupon);
    } catch (error) {
        throw new Error(error)
    }
})

const deleteCoupon = asyncHandler(async(req,res) =>{
    const {id} = req.params
    validateMongoDbId(id)
    try {
        const deletedCoupon = await Category.findByIdAndDelete(id);
        res.json(deletedCoupon);
    } catch (error) {
        throw new Error(error)
    }
})

const getaCoupon = asyncHandler(async(req,res) =>{
    const {id} = req.params
    validateMongoDbId(id)
    try {
        const findCoupon = await Coupon.findById(id);
        res.json(findCoupon);
    } catch (error) {
        throw new Error(error)
    }
})


const getAllCoupon = asyncHandler(async(req,res) =>{
    try {
        const findAllCoupon = await Coupon.find();
        res.json(findAllCoupon);
    } catch (error) {
        throw new Error(error)
    }
})

module.exports = {createCoupon, updateCoupon, deleteCoupon, getaCoupon, getAllCoupon}