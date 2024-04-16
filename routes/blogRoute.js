const express = require('express');
const Router = express.Router();
const {createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, dislikeBlog, uploadBlogImages,} = require('../controllers/blog')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { blogImgResize, uploadPhoto } = require('../middlewares/uploader');


Router.post( '', authMiddleware, isAdmin, createBlog)
Router.get('',getAllBlogs )
Router.get('/:id', getBlog)
Router.delete('/:id', authMiddleware, isAdmin, deleteBlog )
Router.put('/like', authMiddleware, likeBlog)
Router.put('/dislike', authMiddleware, dislikeBlog)
Router.put('/:id', authMiddleware, isAdmin, updateBlog )
Router.put('/upload/:blogId',authMiddleware, isAdmin,uploadPhoto.array('images',10),blogImgResize, uploadBlogImages)
module.exports = Router