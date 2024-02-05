const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  //* userId --> ObjectId, ref "User"
  //* text --> required
  //* picture --> optional
  //* poll --> optional
  //* like --> not user controlled, default 0
  //* comment --> ObjectId, ref "Comment"
  //* shares --> default 0,
  //* tags --> user defined, not mandatory
  //* dateCreated --> Not user defined

  //? USER
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A comment must be written by a user'],
  },

  //? PICTURE
  picture: {
    type: String,
    required: [true, 'Your post cannot be empty'],
    trim: true,
  },
  poll: {
    type: [{
      option: {
        type: String,
        trim: true
      },
      votes: {
        type: Number,
        default: 0
      },
      voters: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }]
    }],
    validate: {
      validator: function(value) {
        value.length <= 6
      },
      message: 'You can only have a maximum of 6 options in a poll'
    }
  },

  //? LIKE
  like: {
    type: Number,
    default: 0
  },

  //? COMMENTS
  comments: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Comment',
    required: [true, 'A comment must be written by a user'],
  },

  //? SHARES
  shares: {
    type: Number,
    default: 0
  },

  //? TAGS
  tags: {
    type: [String],
  },

  //? DATECREATED
  dateCreated: {
    type: Date,
    default: Date.now()
  }


});


const postModel = mongoose.model('Post', postSchema);

module.exports = postModel;