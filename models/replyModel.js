const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'please provide the id of the user who wrote this comment']
    },

    commentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Comment',
        required: [true, 'please provide the id of the comment you intend to reply']
    },

    likes: {
      type: Number,
      default: 0
    },

    reply: {
        type: String,
        required: [true, 'Please write what\'s on your mind, your reply cannot be empty'],
        trim: true,
        validate: {
            validator: function (value) {
              return value.length >= 1;
            },
            message: 'your reply cannot be empty',
          },
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

replySchema.methods.like = function() {
  console.log("::: LIKING :::")
  this.likes += 1

  // console.log(`New likes = ${this.likes}`)
  this.save();
}

replySchema.methods.unlike = function() {
  console.log("::: UNLIKING :::")
  this.likes -= 1

  if(this.likes < 0) return;
  this.save();
}

const replyModel = mongoose.model('Reply', replySchema);

module.exports = replyModel;