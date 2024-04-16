const express = require('express');
const Router = express.Router();
const{createProduct, getAllProducts, getAProduct, updateProduct, deleteProduct, addToWishList, rating, uploadImages} = require('../controllers/product')
const{isAdmin, authMiddleware} = require('../middlewares/authMiddleware');
const { productImgResize, uploadPhoto } = require('../middlewares/uploader');

Router.get('', getAllProducts);
Router.get('/:id', getAProduct); 
Router.post('',authMiddleware,isAdmin, createProduct);
Router.put("/upload/:id", authMiddleware, isAdmin, uploadPhoto.array('images',10), productImgResize,uploadImages )
Router.put('/wishlist', authMiddleware, addToWishList)
Router.put('/rating', authMiddleware, rating)
Router.put('/:id', authMiddleware, isAdmin, updateProduct);


Router.delete('/:id', authMiddleware, isAdmin, deleteProduct);  

module.exports  = Router 