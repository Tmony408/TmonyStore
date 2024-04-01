const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema;
const crypto = require('crypto');

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "user",
    },
    cart: {
        type: Array,
        default: [],
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    address: [{ type: Schema.Types.ObjectId, ref: "Address" }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    refreshToken: {
        type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

},
    { timestamps: true });

userSchema.pre('save', async function (next) {
    try {
        const user = this;
        if (!user.isModified('password')) {
          return next();
        }
        const saltRounds = 10;
        const myPlaintextPassword = this.password;

        // Generate salt
        const salt = await bcrypt.genSalt(saltRounds);

        // Hash plaintext password
        const hash = await bcrypt.hash(myPlaintextPassword, salt);

        // Set hashed password to the user's password property
        this.password = hash;

        next(); // Call next to continue the save operation
    } catch (error) {
        next(error); // Call next with the error to indicate a problem during hashing
    }
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
 

userSchema.methods.createPasswordResetToken = async function(){
    const resettoken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash('sha256').update(resettoken).digest('hex');
    this.passwordResetExpires = Date.now() + 10*60*1000; //10mins;
    return resettoken
} 

//Export the model
module.exports = mongoose.model('User', userSchema);