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
        type:mongoose.Schema.Types.ObjectId,
        ref : "Category"
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId, ref: "Brand" 
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
    images: [],
    color: {
        type: String,
        // enum: ["Black", "White", "Red"]
        required: true
    },
    ratings: [{
        star: Number,
        comment: String,
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],
    totalRating: {
        type: String,
        default: 0
    },

}, { timestamps: true });

//Export the model
module.exports = mongoose.model('Product', productSchema);