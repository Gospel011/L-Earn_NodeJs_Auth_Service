const mongoose = require('mongoose');

const courseInvoiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please specify which user purchased this course']
    },
    authorId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please specify the author who produced this course']
    },
    contentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Content',
        required: [true, 'Please specify which content this payment is for']
    },
    paymentDescription: {
        type: String,
	required: [true, 'Please write a short description on what this payment is for']
    },
    bankName: {
        type: String,
        default: '',
        required: [true, 'An invoice must have a bank name for user to transfer']
    },
    accountNumber: {
        type: String,
        default: '',
        required: [true, 'An invoice must have an account number for user to transfer']
    },
    accountName: {
        type: String,
        default: '',
	required: [true, 'An invoice must have an account name for user to transfer']
    },
    amountPayable: {
        type: Number,
        required: [true, 'Please specify the price this course is to be sold for']
    },
    currency: {
        type: String,
        required: [true, 'Please specify the currency for this transaction']
    },
    invoiceRef: {
        type: String,
        required: [true, 'Please specify the transaction reference for this transaction']
    },
    disbursed: {
        type: Boolean,
        default: false
    },
    amountPaid: {
        type: Number
    },
    paymentMethod: {
        type: String,
        default: 'ACCOUNT_TRANSFER'
    },
    paymentStatus: {
        type: String,
        default: 'PENDING'
    },
    mnfyTransactionRef: {
        type: String
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    paidOn: {
        type: Date,
    }
})

const courseInvoice = mongoose.model('CourseInvoice', courseInvoiceSchema);

module.exports = courseInvoice;



