const mongoose = require('mongoose');

const { Schema } = mongoose
const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    index: {
        type: Number,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    editedAt: {
        type: Date,
        default: Date.now
    },
})
module.exports = mongoose.model('Category', categorySchema);