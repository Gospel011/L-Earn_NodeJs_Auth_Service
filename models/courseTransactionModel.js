const mongoose = require('mongoose');

const courseTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please specify which user purchased this course']
    },
    contentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Content',
        required: [true, 'Please specify which content this payment is for']
    },
    ammount: {
        type: Number,
        required: [true, 'Please specify the price this course was sold for']
    },
    transactionRef: {
        type: String
    },
    transactionStatus: {
        type: String
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    }
})

const courseTransaction = mongoose.model('CourseTransaction', courseTransactionSchema);

module.exports = courseTransaction;



