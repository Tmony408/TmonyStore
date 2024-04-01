const Category = require('../models/category')
const asyncHandler = require('express-async-handler')
const validateMongoDbId = require('../utils/validateMongodbId')

const createCategory = asyncHandler(async(req,res) =>{
    try {
        const newCategory = await Category.create(req.body);
        res.json(newCategory);
    } catch (error) {
        throw new Error(error)
    }
})

const updateCategory = asyncHandler(async(req,res) =>{
    const {id} = req.params
    validateMongoDbId(id)
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
            new:true
        });
        res.json(updatedCategory);
    } catch (error) {
        throw new Error(error)
    }
})

const deleteCategory = asyncHandler(async(req,res) =>{
    const {id} = req.params
    validateMongoDbId(id)
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        res.json(deletedCategory);
    } catch (error) {
        throw new Error(error)
    }
})

const getaCategory = asyncHandler(async(req,res) =>{
    const {id} = req.params
    validateMongoDbId(id)
    try {
        const findCategory = await Category.findById(id);
        res.json(findCategory);
    } catch (error) {
        throw new Error(error)
    }
})


const getAllCategory = asyncHandler(async(req,res) =>{
    try {
        const findAllCategory = await Category.find();
        res.json(findAllCategory);
    } catch (error) {
        throw new Error(error)
    }
})

module.exports = {createCategory, updateCategory, deleteCategory, getaCategory, getAllCategory}