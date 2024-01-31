const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'please provide the id of the user who wrote this comment']
    },

    articleId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Article',
    },

    videoId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Video',
    },

    // TODO: add a postId here

    replies: [
        {type: mongoose.Schema.ObjectId, ref: 'Reply'}
    ],

    likes: {
      type: Number
    },

    comment: {
        type: String,
        required: [true, 'Please provide your comment'],
        trim: true,
        validate: {
            validator: function (value) {
              if (this.isNew || this.isModified('comment')) {
                return value.length === 1;
              } else {
                return true;
              }
            },
            message: 'your comment cannot be empty',
          },
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const commentModel = mongoose.model('Comment', commentSchema);

module.exports = commentModel;