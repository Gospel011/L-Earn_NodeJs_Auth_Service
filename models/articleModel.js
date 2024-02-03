const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "An article must have belong to a user"]
    },
    contentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Content',
        required: [true, "An article must belong to a tutorial"]
    },
    chapterId: {
        type: Number,
        required: [true, "please provide the chapterId of your tutorial"]
    },
    title: {
        type: String,
        required: [true, 'Please provide the title of your article'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Please provide the content of your article'],
        trim: true,
        validate: {
            validator: function (value) {
              if (this.isNew || this.isModified('password')) {
                return !(value.split(/\s+/).length < 300);
              } else {
                return true;
              }
            },
            message: 'An article cannot be too short',
          },
    },
    comments: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Comment'
    }],
    tags: [String],
        
    dateCreated: {
        type: Date,
        defualt: Date.now()
    }

})


const articleModel = mongoose.model('Article', articleSchema);

module.exports = articleModel;