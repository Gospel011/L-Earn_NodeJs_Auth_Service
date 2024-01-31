const mongoose = require('mongoose');

const tutorialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A coverpage should have a title'],
  },
  thumbnailUrl: {
    type: String,
    required: [
      true,
      'Please provide a thumbnail for your tutorial, this is what users would see when scrolling through the Learn page',
    ],
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


const tutorialModel = mongoose.model('Tutorial', tutorialSchema);