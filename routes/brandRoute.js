const express = require('express');
const Router = express.Router();
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { createBrand, updateBrand, deleteBrand, getaBrand, getAllBrand} = require('../controllers/brand')
Router.post('/', authMiddleware, isAdmin, createBrand)
Router.get('/:id', getaBrand )
Router.get('/', getAllBrand )
Router.put('/:id', authMiddleware, isAdmin, updateBrand )
Router.delete('/:id', authMiddleware, isAdmin, deleteBrand )


module.exports = Router