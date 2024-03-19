const User =require('../models/user')
const jwt = require('jsonwebtoken')
const asyncHandler = require("express-async-handler")


const authMiddleware  = asyncHandler(async(req, res, next) =>{
    let token;

    if (req?.headers?.authorization?.startsWith('Bearer')){
        token = req.headers.authorization.split(" ")[1];
        try {
            if (token){
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded?.id)
                req.user = user
                next()
            }
        } catch (error) {
           throw new Error('Not authorized, Token expired. Login again') 
        }
    } else  {
throw new Error("There is no attached token to header")
    }
})

const isAdmin = asyncHandler(async (req, res, next)=>{
    const {email} = req.user;
    // console.log(req.user)
    const adminUser = await User.findOne({email})
    if(adminUser.role.toLowerCase() !== 'admin' ){
        throw new Error("User not Authorized. Admin Access only")
    }else{
        next();
    }
})

module.exports = {authMiddleware,isAdmin}