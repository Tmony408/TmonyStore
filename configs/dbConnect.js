const mongoose = require('mongoose');
const dbUrl = process.env.dbUrl || 'mongodb://localhost:27017/TmonyStore'

const dbConnect = () =>{
    try {
        const connect = mongoose.connect(dbUrl);
        console.log('DB connected successfully')
    } catch (error) {
        console.log('DB connection error')
    }
}

module.exports = dbConnect;