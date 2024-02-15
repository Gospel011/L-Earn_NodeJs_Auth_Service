const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "A video must have belong to a user"]
    },
    contentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Content',
        required: [true, "A video chapter must belong to a tutorial"]
    },
    chapter: {
        type: Number,
        required: [true, "please provide the chapter of your tutorial"]
    },
    url: {
        type: String,
        required: [true, 'Please provide the video url']
    },
    title: {
        type: String,
        required: [true, 'Please provide the title of your video'],
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
        defualt: Date.now
    }

})


const videoModel = mongoose.model('Video', videoSchema);

module.exports = videoModel;