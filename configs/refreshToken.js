const jwtToken = require('jsonwebtoken');
const dotenv = require('dotenv').config()

const generateRefreshToken = (id) =>{
    return jwtToken.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
};
 
module.exports = {generateRefreshToken}