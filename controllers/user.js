const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const {generateToken} = require('../configs/jwtToken');
const validateMongoDbId = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../configs/refreshToken');
const jwt = require('jsonwebtoken');
const { findById } = require('../models/product');
const sendEmail = require('../configs/nodeMailer');
const crypto = require('crypto')


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

const loginControl = asyncHandler(async (req, res) =>{
    // console.log(req.body)
    const {email, password} = req.body;
    const findUser = await User.findOne({email})
    if(findUser && ( await findUser.isPasswordMatched(password))){
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updatedUser = await User.findByIdAndUpdate(findUser?._id, {refreshToken},{new:true})
        res.cookie('refreshToken', refreshToken,{
            httpOnly: true,
            maxAge: 72*60*60*1000
        })
        res.json({
           _id: findUser?._id,
           firstName : findUser?.firstName,
           lastname: findUser?.lastName,
           email: findUser?.email,
           mobile : findUser?.mobile,
           token: generateToken(findUser?.id)
        })
    }else throw new Error("Invalid Credentials");
})


// handle refresh token 
const handleRefreshToken = asyncHandler(async(req,res)=>{
    const cookie = req.cookies;
    // console.log(cookie)
    if(!cookie?.refreshToken) throw new Error('No refresh token in cookies')
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken})
    if(!user) throw new Error("No refresh token present in db or not matched")
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err,decoded)=>{
        if(err || (user.id !== decoded.id)){
            // console.log(err, decoded, user)
            throw new Error("There is something wrong with refresh token")

        }else{
            const accessToken = generateToken(user?.id)
            res.json({accessToken})
        }
})
})

// logout user 
const logOut = asyncHandler(async(req,res)=>{
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error('No refresh token in cookies')
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken})
    if(user){
        await User.findOneAndUpdate({refreshToken}, {
            refreshToken: "",
        })
    }
    res.clearCookie('refreshToken',{
        httpOnly: true,
        secure: true
    })
    res.sendStatus(204)

})

// get all users 
const getAllUsers = asyncHandler(async (req,res)=>{
    try {
        const getUsers = await User.find()
        res.json(getUsers)

    } catch (error) {
        throw new Error(error)
    } 
})

// get a use 
const getAUser = asyncHandler(async (req,res)=>{
    const {id} = req.params;
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
const deleteAUser = asyncHandler(async (req,res)=>{
    const {id} = req.params;
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
const updateAUser = asyncHandler(async (req,res)=>{
    const {id} = req.params;
    validateMongoDbId(id)
    try {
        const updatedUser = await User.findByIdAndUpdate(id,{
            firstName: req?.body?.firstName,
        lastName:  req?.body?.lastName,
        email:  req?.body?.email,
        mobile:  req?.body?.mobile,
        }, {new: true})
        res.json({
           updatedUser,

        }) 
    } catch (error) {
        throw new Error(error)
    }
})

const blockUser = asyncHandler(async(req, res, next)=>{
    const {id} = req.params;
    validateMongoDbId(id)
    try {
       const block = await User.findByIdAndUpdate(id, {
        isBlocked : true
       },
       {new:true})
       res.json("User blocked")
    } catch (error) {
        throw new Error(error)
    }
})

const unblockUser = asyncHandler(async(req, res, next)=>{
    // console.log(req.user)
    const {id} = req.params;
    validateMongoDbId(id)
    try {
       const block = await User.findByIdAndUpdate(id, {
        isBlocked : false
       },
       {new:true})
       res.json("User unblocked")
    } catch (error) {
        throw new Error(error)
    }
})

// update password 
const updatePassword = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    const {password} = req.body;
    validateMongoDbId(_id);
    const user = await findById(_id);
    if(password){
        user.password =password;
        user.passwordChangedAt = Date.now()
        const updatedPassword = await user.save();
        res.json(updatedPassword)
    }else res.json(user)
})


// forgot password token 
const forgotPasswordToken = asyncHandler(async(req,res) =>{
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) throw new Error ('User not found with this email')
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
const resetPassword = asyncHandler(async(req,res)=>{
    const {password} = req.body;
    const {token} = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    let user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()},

    })
    if(!user) throw new Error(" Token Expired, Try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now()
    await user.save();
    res.json(user)
})

module.exports = { createUser,loginControl , getAllUsers, getAUser, deleteAUser, updateAUser, blockUser, unblockUser, handleRefreshToken,logOut, updatePassword, forgotPasswordToken, resetPassword}