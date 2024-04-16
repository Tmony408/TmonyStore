const Blog = require('../models/blog')
const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId')
const cloudinaryUploadImage  = require('../utils/cloudinary');
const fs = require('fs')



const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body)
        res.json({
            status: "success",
            newBlog
        })
    } catch (error) {
        throw new Error(error)
    }
});


const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoDbId(id)
    try {
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true
        })
        res.json({
            updateBlog
        })
    } catch (error) {
        throw new Error(error)
    }
});

const getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoDbId(id)
    try {
        const findBlog = await Blog.findById(id)
        const viewedBlog = await Blog.findByIdAndUpdate(id, {
            $inc: { numViews: 1 },
        },
            { new: true })
        res.json({
            findBlog, viewedBlog
        })
    } catch (error) {
        throw new Error(error)
    }
});

const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const AllBlogs = await Blog.find()
        res.json({
            status: "success",
            AllBlogs
        })
    } catch (error) {
        throw new Error(error)
    }
});

const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoDbId(id)
    try {
        const deletedBlog = await Blog.findByIdAndDelete()
        res.json({
            deletedBlog
        })
    } catch (error) {
        throw new Error(error)
    }
});

const likeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body
    validateMongoDbId(blogId)
    const blog = await Blog.findById(blogId).populate('dislikes');
    const loggedInUser = req?.user?._id;
    const isliked = blog.isLiked

    // Find if user has disliked the blog
    let alreadyDisliked;
    for (let user of blog.dislikes) {
        if (user._id.toString() === loggedInUser.toString()) {
            alreadyDisliked = true;
            break
        } else continue
    }
    if (alreadyDisliked) {
        const updateblog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { dislikes: loggedInUser },
            isDisliked: false,
        }, { new: true });
    }

    if (isliked) {
        const updateblog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { likes: loggedInUser },
            isLiked: false
        }, { new: true });
        res.json(updateblog)
    }
    if (alreadyDisliked || !isliked) {
        const updateblog = await Blog.findByIdAndUpdate(blogId, {
            $push: { likes: loggedInUser },
            isLiked: true
        }, { new: true });
        res.json(updateblog)
    }

})

const dislikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body
    validateMongoDbId(blogId)
    const blog = await Blog.findById(blogId).populate('likes');
    const loggedInUser = req?.user?._id;
    const isdisliked = blog.isDisliked

    // Find if user has disliked the blog
    let alreadyLiked;
    const users = blog.likes
    for (let user of users) {
        if (user._id.toString() == loggedInUser.toString()) {
            alreadyLiked = true; 
            break
        } else continue
    }
// Alternative way to get already liked, make sure you remove the populate in the dislikes
    //     const alreadyLiked = blog.dislikes.find(
    //         (userId) => userId.toString() === loggedInUser.toString()
    //     )
    console.log(alreadyLiked)

    if (alreadyLiked) {
        const updateblog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { likes: loggedInUser },
            isLiked: false,
        },
            { new: true });

    }

    if (isdisliked) {
        const updateblog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { dislikes: loggedInUser },
            isDisliked: false
        }, { new: true });
        res.json(updateblog)
    }
    if (alreadyLiked || !isdisliked) {
        const updateblog = await Blog.findByIdAndUpdate(blogId, {
            $push: { dislikes: loggedInUser },
            isDisliked: true
        }, { new: true });
        res.json(updateblog)
    }
})


const uploadBlogImages = asyncHandler(async(req,res) =>{
    const {blogId} = req.params;
    validateMongoDbId(blogId);
    try {
        const uploader = (path) => cloudinaryUploadImage(path, 'images');
        const urls = [];
        const files = req.files
        console.log(files)
        for (const file of files){
            const {path} = file;
            const newPath = await uploader(path);
            console.log(newPath)
            urls.push(newPath)
            fs.unlinkSync( newPath)
        }
        const blog = await Product.findByIdAndUpdate(blogId, {
            images: urls.map((file) =>{
                return file
            }),
        },{
            new:true,
        })
        res.json(blog);
    } catch (error) {
        throw new Error(error)
    }
})


module.exports = { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, dislikeBlog, uploadBlogImages }  