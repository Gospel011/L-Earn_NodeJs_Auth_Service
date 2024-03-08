const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        required: true
    },
    userToFollow: {
        type: mongoose.Schema.ObjectId,
        required: true
    },

    dateCreated: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Follow', followSchema);