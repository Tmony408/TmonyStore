const User = require('../models/user')
const Product = require('../models/product')
const Cart = require('../models/cart')
const Coupon = require('../models/coupon')
const Order = require('../models/order')
const asyncHandler = require('express-async-handler')
const { generateToken } = require('../configs/jwtToken');
const validateMongoDbId = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../configs/refreshToken');
const jwt = require('jsonwebtoken');
const { findById } = require('../models/product');
const sendEmail = require('../configs/nodeMailer');
const crypto = require('crypto')
const uniqid = require('uniqid')


const createUser = asyncHandler(async (req, res) => {
    // console.log(req.body)
    const email = req.body.email;
    const findUser = await User.findOne({ email: email })
    if (!findUser) {
        const newUser = await User.create(req.body)
        res.json(newUser)
    } else {
        throw new Error('user already exist')

    }
}
)

const loginControl = asyncHandler(async (req, res) => {
    // console.log(req.body)
    const { email, password } = req.body;
    const findUser = await User.findOne({ email })
    if (findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updatedUser = await User.findByIdAndUpdate(findUser?._id, { refreshToken }, { new: true })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000
        })
        res.json({
            _id: findUser?._id,
            firstName: findUser?.firstName,
            lastname: findUser?.lastName,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?.id)
        })
    } else throw new Error("Invalid Credentials");
})

// admin login

const adminLogin = asyncHandler(async (req, res) => {
    // console.log(req.body)

    try {
        const { email, password } = req.body;
        const adminUser = await User.findOne({ email })
        if (!adminUser) {
            let err = new Error('Not authorized');
            err.statusCode = 401;
            throw err;
        }
        if (adminUser.role !== 'admin') throw new Error('Not Authorized')
        if (await adminUser.isPasswordMatched(password)) {
            const refreshToken = await generateRefreshToken(adminUser?._id);
            const updatedUser = await User.findByIdAndUpdate(adminUser?._id, { refreshToken }, { new: true })
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000
            })
            res.json({
                _id: adminUser?._id,
                firstName: adminUser?.firstName,
                lastname: adminUser?.lastName,
                email: adminUser?.email,
                mobile: adminUser?.mobile,
                token: generateToken(adminUser?.id)
            })
        } else throw new Error("Invalid Credentials");

    } catch (error) {
        throw new Error(error)
    }
})


// handle refresh token 
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    // console.log(cookie)
    if (!cookie?.refreshToken) throw new Error('No refresh token in cookies')
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken })
    if (!user) throw new Error("No refresh token present in db or not matched")
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || (user.id !== decoded.id)) {
            // console.log(err, decoded, user)
            throw new Error("There is something wrong with refresh token")

        } else {
            const accessToken = generateToken(user?.id)
            res.json({ accessToken })
        }
    })
})

// logout user 
const logOut = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No refresh token in cookies')
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken })
    if (user) {
        await User.findOneAndUpdate({ refreshToken }, {
            refreshToken: "",
        })
    }
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    })
    res.sendStatus(204)

})

// get all users 
const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find()
        res.json(getUsers)

    } catch (error) {
        throw new Error(error)
    }
})

// get a use 
const getAUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const getUser = await User.findById(id)
        res.json({
            getUser,

        })
    } catch (error) {
        throw new Error(error)
    }
})

// delete a user
const deleteAUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const deleteUser = await User.findByIdAndDelete(id)
        res.json({
            deleteUser,

        })
    } catch (error) {
        throw new Error(error)
    }
})

// update a user 
const updateAUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const updatedUser = await User.findByIdAndUpdate(id, {
            firstName: req?.body?.firstName,
            lastName: req?.body?.lastName,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
        }, { new: true })
        res.json({
            updatedUser,

        })
    } catch (error) {
        throw new Error(error)
    }
})

const blockUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const block = await User.findByIdAndUpdate(id, {
            isBlocked: true
        },
            { new: true })
        res.json("User blocked")
    } catch (error) {
        throw new Error(error)
    }
})

const unblockUser = asyncHandler(async (req, res, next) => {
    // console.log(req.user)
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const block = await User.findByIdAndUpdate(id, {
            isBlocked: false
        },
            { new: true })
        res.json("User unblocked")
    } catch (error) {
        throw new Error(error)
    }
})

// update password 
const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await findById(_id);
    if (password) {
        user.password = password;
        user.passwordChangedAt = Date.now()
        const updatedPassword = await user.save();
        res.json(updatedPassword)
    } else res.json(user)
})


// forgot password token 
const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found with this email')
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, Please follow this link to reset your password. this link is valid till 10 minutes from now.  <a href="http://localhost:5000/api/user/reset-password/${token}">Click Here</a>`
        const data = {
            to: email,
            text: 'Hey User',
            subject: "Forgot password Link",
            html: resetURL,
        };
        sendEmail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error)
    }
})

// reset password 
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    let user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },

    })
    if (!user) throw new Error(" Token Expired, Try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now()
    await user.save();
    res.json(user)
})


const getWishList = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    try {
        const findUser = await User.findById(_id).populate('wishlist')
        res.json(findUser)
    } catch (error) {
        throw new Error
    }
})

const addAddress = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(id)
    try {
        const updatedUser = await User.findByIdAndUpdate(id, {
            address: req?.body?.address
        }, { new: true })
        res.json({
            updatedUser,

        })
    } catch (error) {
        throw new Error(error)
    }
})

const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id)
    try {
        let products = [];
        const user = await User.findById(_id)
        const alreadyExistCart = await Cart.findOneAndDelete({ orderby: user._id });
        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select('price').exec()
            object.price = getPrice.price
            products.push(object);
        }
        let cartTotal = products.reduce((total, current) => total + (current.price * current.count), 0)
        let newCart = await new Cart({
            products,
            cartTotal,
            orderby: user?._id,

        }).save()
        res.json(newCart)
    } catch (error) {
        throw new Error(error)
    }
})

const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const cart = await Cart.findOne({ orderby: _id }).populate('products.product', 'title price _id')
        console.log(cart)
        res.json(cart)
    } catch (error) {
        throw new Error(error)
    }
})
const emptyUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const cart = await Cart.findOneAndDelete({ orderby: _id })
        res.json(cart)
    } catch (error) {
        throw new Error(error)
    }
})

const applyCoupon = asyncHandler(async (req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user
    validateMongoDbId(_id)
    try {
        const validCoupon = await Coupon.findOne({ name: coupon });
        if (validCoupon === null) throw new Error('invalid Token')
        const user = await User.findOne({ _id });
        let { cartTotal } = await Cart.findOne({ orderby: _id })
        let totalAfterDiscount = cartTotal - ((cartTotal * validCoupon.discount) / 100).toFixed(2);
        console.log(typeof totalAfterDiscount, totalAfterDiscount)
        await Cart.findOneAndUpdate({ orderby: _id }, { totalAfterDiscount }, { new: true })
        res.json(totalAfterDiscount)
    } catch (error) {
        throw new Error(error)
    }
})

    const createOrder = asyncHandler(async (req, res) => {
        const { Submitted, couponApplied } = req.body;
        const { _id } = req.user;
        validateMongoDbId(_id);
        try {
            if (!Submitted) throw new Error("Submition failed");
            const user = await User.findById(_id);
            let userCart = await Cart.findOne({ orderby: _id }).populate('products.product')
            let finalAmount = 0
            if (couponApplied && userCart.totalAfterDiscount) {
                finalAmount = userCart.totalAfterDiscount
            } else finalAmount = userCart.cartTotal

            let newOrder = await new Order({
                products: userCart.products,
                paymentIntent: {
                    id: uniqid(),
                    method: "COD",
                    amount: finalAmount,
                    status: "Submitted",
                    created: Date.now(),
                    currency: "usd",
                },
                orderby: user._id,
                orderStatus: "Submitted",


            }).save();
            let update = userCart.products.map((item) => {
                return {
                    updateOne: {
                        filter: { _id: item.product._id },
                        update: { $inc: { quantity: -item.count, sold: +item.count } },
                    }
                }
            })
            const updated = await Product.bulkWrite(update, {});
            res.json({ message: 'success' })
        } catch (error) {
            throw new Error(error)
        }

    })


    const getOrders = asyncHandler(async (req, res) => {
        const { id } = req.body;
        validateMongoDbId(_id)
        try {
            const userOrders = await Order.findOne({orderby:id}).populate('products.product').populate('orderby').exec()
            res.json(userOrders)
        } catch (error) {
            throw new Error(error)
        }
    })

    const updateOrderStatus = asyncHandler(async(req,res)=>{
        const {status} = req.body;
        const {id} = req.params;
        validateMongoDbId(id);
        try {
            const findOrder = await Order.findByIdAndUpdate(id,{
                orderStatus: status,
                paymentIntent:{
                    status:status,
                },
            },{
                new:true
            }).populate('products.product')
            res.json(findOrder)
        } catch (error) {
            throw new Error(error)
        }
    })

    module.exports = {
        createUser,
        loginControl,
        getAllUsers,
        getAUser,
        deleteAUser,
        updateAUser,
        blockUser,
        unblockUser,
        handleRefreshToken,
        logOut,
        updatePassword,
        forgotPasswordToken,
        resetPassword,
        adminLogin,
        getWishList,
        addAddress,
        userCart,
        getUserCart,
        emptyUserCart,
        applyCoupon,
        createOrder,
        getOrders,
        updateOrderStatus
    }