const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,

    },
    category: {
        type: String,
        required: true,

    },
    numViews: {
        type: Number,
        default: 0,
    },
    images: [{
        type: String,
        default: ""
    }],
    isLiked: {
        type: Boolean,
        default: false,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isDisliked: {
        type: Boolean,
        default: false,
    },
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    author: {
        type: String,
        default: "Admin"
    },

},
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
        timestamps: true,
    }
);

//Export the model
module.exports = mongoose.model('Blog', blogSchema);