const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'please provide the id of the user who wrote this review']
    },

    tutorialId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tutorial',
        required: [true, 'please provide the id of the tutorial this review belongs to.']
    },

    likes: {
      type: Number
    },

    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const ratingModel = mongoose.model('Rating', ratingSchema);

module.exports = ratingModel;