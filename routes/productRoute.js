const express = require('express');
const Router = express.Router();
const{createProduct, getAllProducts, getAProduct, updateProduct, deleteProduct, addToWishList, rating} = require('../controllers/product')
const{isAdmin, authMiddleware} = require('../middlewares/authMiddleware');

Router.get('', getAllProducts);
Router.get('/:id', getAProduct);
Router.post('',authMiddleware,isAdmin, createProduct);
Router.put('/wishlist', authMiddleware, addToWishList)
Router.put('/rating', authMiddleware, rating)
Router.put('/:id', authMiddleware, isAdmin, updateProduct);


Router.delete('/:id', authMiddleware, isAdmin, deleteProduct); 

module.exports  = Router