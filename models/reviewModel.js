const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'please provide the id of the user who wrote this review']
    },

    contentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Content',
        required: [true, 'please provide the id of the content this review belongs to.']
    },

    review: {
        type: String,
        required: [true, "Your review cannot be empty"],
        trim: true,
        validate: {
            validator: function(value) {
                return value.length > 1;
            }
        },
        message: "Your review cannot be empty"
    },

    rating: {
        type: Number,
        required: [true, 'Please provide a rating for your review'],
        default: 1,
        validate: {
            validator: function(value) {
                return value > 0;
            },
            message: "Your rating cannot be less than 1"
        }
    },

    likes: {
      type: Number
    },

    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

const ratingModel = mongoose.model('Review', reviewSchema);

module.exports = ratingModel;