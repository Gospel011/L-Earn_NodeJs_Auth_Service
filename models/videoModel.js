const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "A video must have belong to a user"]
    },
    contentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Content',
        required: [true, "A video must belong to a tutorial"]
    },
    chapterId: {
        type: Number,
        required: [true, "please provide the chapterId of your tutorial"]
    },
    url: {
        type: String,
        required: [true, 'Please provide the video url']
    },
    title: {
        type: String,
        required: ['true', 'Please provide the title of your video'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    comments: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Comment'
    }],
    
    tags: [
        String
    ],
    
    dateCreated: {
        type: Date,
        defualt: DateTime.now()
    }

})


const videoModel = mongoose.model('Video', videoSchema);

module.exports = videoModel;