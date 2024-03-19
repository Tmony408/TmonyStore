const jwtToken = require('jsonwebtoken');
const dotenv = require('dotenv').config()

const generateToken = (id) =>{
    return jwtToken.sign({id}, process.env.JWT_SECRET, {expiresIn: "3d"})
};
 
module.exports = {generateToken}