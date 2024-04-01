
const Product = require('..//models/product')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify');
const product = require('..//models/product');

// create product 
const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) req.body.slug = slugify(req.body.title)
        const newProduct = await Product.create(req.body)
        res.json(newProduct)
    } catch (error) {
        throw new Error(error);
    }
});

// update product 
const updateProduct = (async (req, res) => {
    try {
        const { id } = req.params
        if (req.body.title) req.body.slug = slugify(req.body.title)
        const updateProduct = await Product.findByIdAndUpdate(id, req.body, { new: true })
        res.json(updateProduct)
    } catch (error) {
        throw new Error(error);
    }
});


//  delete product 
const deleteProduct = (async (req, res) => {
    try {
        const { id } = req.params
        const deletedProduct = await Product.findByIdAndDelete(id);
        res.json(deletedProduct)
    } catch (error) {
        throw new Error(error);
    }
});

// get a product 
const getAProduct = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params
        const foundProduct = await Product.findOne(id);
        res.json(foundProduct)
    } catch (error) {
        throw new Error(error);
    }
})


// get all products 
const getAllProducts = asyncHandler(async (req, res) => {
    try {

        // filtering
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach((el) => delete queryObj[el]);
        const queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        let query = await product.find(JSON.parse(queryString));

        // sorting 
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else query = query.sort("-createdAt")


        // limiting the fields
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else query = query.select('-__v');


        // pagination 
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCount = await product.countDocuments();
            if (skip >= productCount) throw new Error('this page does not exist')
        }

        const allProdcts = await query;
        res.json(allProdcts)
    } catch (error) {
        throw new Error(error);
    }
})

const addToWishList = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
        const user = await User.findById(_id)
        const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId)
        if (alreadyAdded) {
            let user = await User.findByIdAndUpdate(_id, {
                $pull: { wishlist: prodId },

            }, { new: true })
            res.json(user)
        } else {
            let user = await User.findByIdAndUpdate(_id, {
                $push: { wishlist: prodId },

            }, { new: true })
            res.json(user)
        }
    } catch (error) {
        throw new Error(error)
    }
})

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, prodId } = req.body;
    try {
        const product = await Product.findById(prodId);
        let alreadyRated = await product.ratings.find((userId) => userId.postedBy.toString() === _id.toString())
        if (alreadyRated) {
            const updateRating = await Product.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated}
                },
                {
                    $set: {"ratings.$.star": star}
                },
                {
                    new: true
                }
            )
            res.json(updateRating)
        } else {
            const ratedProduct = await Product.findByIdAndUpdate(prodId, {
                $push: {
                    ratings: {
                        star: star,
                        postedBy: _id,
                    }
                }
            }, { new: true }

            )
            res.json(ratedProduct)
        }
        const getallratings = await Product.findById(prodId);
        let totalRating = getallratings.ratings.length;
        let ratingsum = getallratings.ratings
            .map((item) => item.star)
            .reduce((prev, curr) => prev_curr, 0);
        let actualRating = Math.round(ratingsum/totalRating);
       let finalproduct = await Product.findByIdAndUpdate(
        prodId,
        {
            totalRating: actualRating,
        },
        {new: true}
       )
       res.json(finalproduct)

    } catch (error) {
        throw new Error(error)
    }
})



module.exports = { createProduct, getAProduct, getAllProducts, updateProduct, deleteProduct, addToWishList, rating };