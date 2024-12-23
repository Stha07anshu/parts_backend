const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { // Single field for full name as per the frontend form
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
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;