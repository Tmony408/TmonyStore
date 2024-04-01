const express = require('express');
const Router = express.Router();
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { createCategory, updateCategory, deleteCategory, getaCategory, getAllCategory} = require('../controllers/blogCategory')
Router.post('/', authMiddleware, isAdmin, createCategory)
Router.get('/:id', getaCategory )
Router.get('/', getAllCategory )
Router.put('/:id', authMiddleware, isAdmin, updateCategory )
Router.delete('/:id', authMiddleware, isAdmin, deleteCategory )


module.exports = Router