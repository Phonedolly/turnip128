const mongoose = require('mongoose');

const { Schema } = mongoose
const userSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    },
    salt: {
        type: String,
        required: true,
        unique: false,
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },

})
module.exports = mongoose.model('User', userSchema);