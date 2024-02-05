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
    postId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
    },

    replies: [
        {type: mongoose.Schema.ObjectId, ref: 'Reply'}
    ],

    likes: {
      type: Number,
      default: 0
    },

    comment: {
        type: String,
        required: [true, 'Your comment cannot be empty'],
        trim: true,
        validate: {
            validator: function (value) {
              return value.length > 0;
            },
            message: 'your comment cannot be empty',
          },
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

commentSchema.methods.addReply = function(replyId) {
    console.log("::: IN COMMENT SCHEMA :::");
  this.replies.push(replyId);
  this.save();
}

commentSchema.methods.deleteReply = function(replyId) {
    console.log("::: DELETING REPLY :::");
    const replyIndex = this.replies.indexOf(replyId);
    this.replies.splice(replyIndex, 1);
    this.save();
}

commentSchema.methods.like = function() {
    console.log("::: LIKING :::")
    this.likes += 1
  
    // console.log(`New likes = ${this.likes}`)
    this.save();
  }
  
  commentSchema.methods.unlike = function() {
    console.log("::: UNLIKING :::")
    this.likes -= 1

    if(this.likes < 0) return;
    this.save();
  }

const commentModel = mongoose.model('Comment', commentSchema);

module.exports = commentModel;