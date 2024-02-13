const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  //* userId --> ObjectId, ref "User"
  //* text --> required
  //* image --> optional
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

  //? TEXT
  text: {
    type: String,
    required: [true, 'Your post cannot be empty'],
    trim: true,
    validate: {
      validator: function (value) {
        return value.length >= 1;
      },
      message: 'Your post cannot be empty',
    },
  },

  //? PICTURE
  image: {
    type: String,
  },

  //? POLL
  poll: {
    type: [
      {
        option: {
          type: String,
          trim: true,
          required: [true, 'Your option cannot be empty'],
        },
        votes: {
          type: Number,
          default: 0,
        },
        voters: [
          {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
          },
        ],
      },
    ],
    validate: {
      validator: function (value) {
        if (Array.isArray(value) && value.length > 0) {
          return value.length >= 2 && value.length <= 6;
        }
        return true;
      },
      message:
        'A poll can only have a minimum of two options and a maximum of six',
    },
  },

  //? LIKE
  likes: {
    type: [mongoose.Schema.ObjectId],
    ref: 'User'
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
    default: 0,
  },

  //? TAGS
  tags: {
    type: [String],
  },

  //? DATECREATED
  dateCreated: {
    type: Date,
    default: Date(),
  },
});

postSchema.methods.like = function(userId) {
  let res;
  if(!userId) return;
  if(this.likes.includes(userId)) {
    const index = this.likes.indexOf(userId)
    this.likes.splice(index, 1)

    res = {
      likes: this.likes.length,
      liked: false
    }
  } else {
    this.likes.push(userId); 

    res = {
      likes: this.likes.length,
      liked: true,
    }
  }

  this.save();
  return res;
}

postSchema.methods.deleteComment = function(userId) {
  const indexToDelete = this.comments.indexOf(userId);
  this.comments.splice(indexToDelete, 1);
  this.save();
}

postSchema.methods.getLikeStatus = function(userId) {
  
  this.likes = {
    likes: this.likes.length,
    liked: this.likes.includes(userId)
  }

  // next()
}


postSchema.methods.vote = async function (userId, optionId) {

  this.poll.map((option) => {
    
    if (option.voters.includes(userId)) {
      // delte previous vote
      const index = option.voters.indexOf(userId);
      option.voters.splice(index, 1);
      option.votes -= 1;
      return option; //returns
    }
    
    // look through all options, anyone that has the optionId, add the userId into the voters list and increase the votes by 1

    if (option._id == optionId) {
      console.log('::::: voting ::::::');
      console.log(`option is ${option}`);

      option.voters.push(userId);
      option.votes += 1;
      return option;
    } else {
      return option;
    }
  });

  await this.save();
};

const postModel = mongoose.model('Post', postSchema);

module.exports = postModel;
