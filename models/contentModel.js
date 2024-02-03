const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, "Please specify who has this content"]
  },
  type: {
    type: String,
    required: [true, 'Please provide the type of content you intend to create, video or book?'],
    lowercase: true,
    enum: {
      values: ['video', 'book'],
      trim: true,
      message: "Your content type can only be video or book"
    }
  },
  title: {
    type: String,
    required: [true, 'A content should have a title'],
  },
  thumbnailUrl: {
    type: String,
    required: [
      true,
      'Please provide a thumbnail for your content, this is what users would see when scrolling through the Learn page',
    ],
  },
  description: {
    type: String,
    trim: true
  },
  averageRating: {
    type: Number,
    default: 0
  },
  numberOfRatings: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0,
    validate: {
      validator: function(value) {
        return value <= 2000;
      },
      message: "You may only set a price of \u20A62,000 max"
    }
  },
  videos: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Video',
  }],
  articles: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Article',
  }],
  students: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  dateCreated: {
    type: Date,
    default: Date.now()
  },
  tags: [String]
});


const contentModel = mongoose.model('Content', contentSchema);

module.exports = contentModel

