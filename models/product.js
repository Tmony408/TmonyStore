const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    category: {
        // type:mongoose.Schema.Types.ObjectId,
        // ref : "Category"
        type: String,
        required: true
    },
    brand: {
        type: String,
        // enum: ["Apple", "Samsung", "Lenovo"]
        required: true
    },
    quantity: {
        type: Number,
        select: false
    },
    sold: {
        type: Number,
        default: 0,
        select: false
    },
    images: {
        type: Array
    },
    color: {
        type: String,
        // enum: ["Black", "White", "Red"]
        required: true
    },
    ratings: [{
        star: Number,
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],

}, { timestamps: true });

//Export the model
module.exports = mongoose.model('Product', productSchema);