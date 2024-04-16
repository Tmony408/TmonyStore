
const Product = require('..//models/product')
const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify');
const product = require('..//models/product');
const validateMongoDbId = require('../utils/validateMongodbId');
const cloudinaryUploadImage = require('../utils/cloudinary');
const fs = require('fs')
const { rimrafSync } = require('rimraf');

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
       let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        let query =  Product.find(JSON.parse(queryString));
        // sorting 
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(', ');
            query = query.sort(sortBy);
        } else {
            query = query.sort({ createdAt: -1 }); // Default sorting by createdAt descending
        }


        // limiting the fields
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query =  query.select(fields);
        } else query =  query.select('-__v');


        // pagination 
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) throw new Error('this page does not exist')
        }

        let allProdcts = await query;
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
    const { star, comment, prodId } = req.body;
    validateMongoDbId(prodId)
    try {
        const product = await Product.findById(prodId);
        if (!product) throw new Error("Product does not exist")
        let alreadyRated = await product.ratings.find((userId) => userId.postedBy.toString() === _id.toString())
        if (alreadyRated) {
            const updateRating = await Product.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated }
                },
                {
                    $set: {
                        "ratings.$.star": star,
                        "ratings.$.comment": comment
                    }
                },
                {
                    new: true
                }
            )
        } else {
            const ratedProduct = await Product.findByIdAndUpdate(prodId, {
                $push: {
                    ratings: {
                        star: star,
                        comment: comment,
                        postedBy: _id,
                    }
                }
            }, { new: true }

            )
        }
        const getallratings = await Product.findById(prodId);
        let totalRating = getallratings.ratings.length;
        let ratingsum = getallratings.ratings
            .map((item) => item.star)
            .reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingsum / totalRating);
        console.log(actualRating)
        let finalproduct = await Product.findByIdAndUpdate(
            prodId,
            {
                totalRating: actualRating,
            },
            { new: true }
        )
        res.json(finalproduct)

    } catch (error) {
        throw new Error(error)
    }
})






// function del(filePath, intervalId) {
//     fs.open(filePath, 'r+', function(err, fd) {
//         if (err) {
//             if (err.code === 'EBUSY') {
//                 // File is busy, do nothing and wait for the next attempt
//                 console.log(`${filePath} is busy, retrying...`);
//             } else if (err.code === 'ENOENT') {
//                 // File does not exist, clear the interval
//                 console.log(`${filePath} deleted or does not exist.`);
//                 clearInterval(intervalId);
//             } else {
//                 // Other errors, log and clear the interval to stop trying
//                 console.error(`Error deleting ${filePath}: ${err}`);
//                 clearInterval(intervalId);
//             }
//         } else {
//             // No error on opening, proceed to close and unlink
//             fs.close(fd, function(err) {
//                 if (!err) {
//                     fs.unlink(filePath, function(err) {
//                         if (!err) {
//                             console.log(`${filePath} deleted.`);
//                             clearInterval(intervalId);
//                         } else {
//                             console.error(`Error unlinking ${filePath}: ${err}`);
//                             // Don't clear the interval, will try again
//                         }
//                     });
//                 } else {
//                     console.error(`Error closing ${filePath}: ${err}`);
//                     // Don't clear the interval, will try again
//                 }
//             });
//         }
//     });
// }

const uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const uploader = (path) => cloudinaryUploadImage(path, 'images');
        const urls = [];
        const files = req.files
        console.log(files)
        for (const file of files) {
            const { path } = file;
            const newPath = await uploader(path);
            console.log({ path })
            urls.push(newPath)
            const prodpath = path.replace("public\\images", "public\\images\\products")
            // fs.unlinkSync(path)
            const product = await Product.findByIdAndUpdate(id, {
                images: urls.map((file) => {
                    return file
                }),
            }, {
                new: true,
            })
            res.json(product);
        }
    } catch (error) {
        throw new Error(error)
    }
})


module.exports = { createProduct, getAProduct, getAllProducts, updateProduct, deleteProduct, addToWishList, rating, uploadImages };