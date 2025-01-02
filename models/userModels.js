const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    salt: {
        type: String,
        required: true
    },
    otp: { // Store OTP temporarily for validation
        type: String,
        default: null
    },
    otpExpiration: { // Store OTP expiration time
        type: Date,
        default: null
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
