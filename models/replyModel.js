const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'please provide the id of the user who wrote this comment']
    },

    commetId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Comment',
        required: [true, 'please provide the id of the comment you intend to reply']
    },

    likes: {
      type: Number
    },

    reply: {
        type: String,
        required: [true, 'Please provide your comment'],
        trim: true,
        validate: {
            validator: function (value) {
              if (this.isNew || this.isModified('comment')) {
                return value.length >= 1;
              } else {
                return false;
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

const replyModel = mongoose.model('Reply', replySchema);

module.exports = replyModel;