const asyncHandler = require('../utils/asyncHandler');
const mnfy = require('../utils/mnfy');
const Content = require('../models/contentModel');
const CourseInvoice = require('../models/courseInvoiceModel');
const User = require('../models/userModel');
const { generateReference } = require('../utils/mnfy');
const AppError = require('../utils/appError');
const QueryProcessor = require('../utils/queryProcessor');
const axios = require('axios');

exports.initializeInvoice = asyncHandler(async (req, res, next) => {

return next(new AppError("This feature is awaiting verification by payment provider. We would update you once it's live."));

  const { contentId } = req.params;
  const userId = req.user._id;
  if (!contentId || contentId == ':contentId')
    return next(
      new AppError('Please specify which content you intend to purchase', 400)
    );

  const token = await mnfy.login();

  const targetContent = await Content.findById(contentId);
  if (!targetContent)
    return next(new AppError('The requested content does not exist'));

  const user = await User.findById(userId);

  const price = targetContent.price;
  const invoiceUrl = `${process.env.BASE_URL}/api/v1/invoice/create`;
  const invoiceReference = generateReference(user._id);
  const invoiceDetails = {
    amount: `${price}`,
    invoiceReference: invoiceReference,
    description: `Payment for ${targetContent.title}`,
    currencyCode: 'NGN',
    contractCode: process.env.CONTRACT_CODE,
    customerEmail: user.email,
    customerName: `${user.firstName} ${user.lastName}`,
    expiryDate: getDateTwentyMinutesIntoTheFuture(),
    paymentMethods: ['ACCOUNT_TRANSFER'],
  };

  console.log(`DateTime: ${Date.now() + 20 * 60 * 1000}`);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  //? MAKE POST REQUEST
  const response = await axios.post(invoiceUrl, invoiceDetails, { headers });
  const invoice = response.data.responseBody;

  const courseInvoice = await CourseInvoice.create({
    userId,
    authorId: targetContent.authorId,
    contentId,
    bankName: invoice.bankName,
    accountNumber: invoice.accountNumber,
    accountName: invoice.accountName,
    paymentDescription: invoiceDetails.description,
    amountPayable: `${price}`,
    currency: invoiceDetails.currencyCode,
    invoiceRef: invoiceReference,
  });

  const finalInvoice = {...response.data.responseBody};

  finalInvoice.dateCreated = courseInvoice.dateCreated;

  res.status(200).json({
    status: 'success',
    response: finalInvoice,
  });
});

const getDateTwentyMinutesIntoTheFuture = () => {
  // Calculate timestamp for 20 minutes from now
  const twentyMinutesFromNow = Date.now() + 20 * 60 * 1000;

  // Convert timestamp to Date object
  const date = new Date(twentyMinutesFromNow);

  date.setHours(date.getHours() + 1);

  // Format the Date object to yyyy-MM-dd HH:mm:ss format
  const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');

  console.log('::::: Formatted Date: ', formattedDate);
  return formattedDate;
};

exports.getCoursePaymentsStatistics = asyncHandler(async (req, res, next) => {
  const aggregatedPayments = await CourseInvoice.aggregate([
    {
      $match: {
        authorId: { $eq: req.user._id },
        paymentStatus: { $eq: 'PAID' }, //? payments for courses whose author is the current user
      },
    },
    {
      $group: {
        _id: '$contentId',
        sales: { $sum: 1 }, //? total sales for a particular course
        profit: { $sum: { $multiply: ['$amountPaid', 0.60] } }, //? toal profit payable made from the course
      },
    },
    {
      //? populate the contents field
      $lookup: {
        from: 'contents',
        localField: '_id',
        foreignField: '_id',
        as: 'content',
      },
    },
    {
      //? flatten it
      $unwind: '$content',
    },
    {
      //? some reshaping
      $project: {
        profit: {
          $multiply: [{ $floor: { $multiply: ['$profit', 100] } }, 0.01],
        },
        sales: 1,
        content: 1,
      },
    },
    {
      //? sort the documents
      $sort: { 'content.dateCreated': -1 },
    },
  ]);

  //? send response to client
  res.status(200).json({
    status: 'success',
    aggregatedPayments,
  });
});

exports.confirmPayment = asyncHandler(async (req, res, next) => {
  const { contentId, chapterId } = req.params;
  const { type } = req.query;

  //? Get content
  const content = await Content.findById(contentId);

  //? Check if the current user is the author of the requested content
  console.log({
    authorId: content.authorId,
    userId: req.user._id,
    equal: content.authorId.toString() === req.user._id.toString(),
  });
  if (content.authorId.toString() === req.user._id.toString()) {
    console.log(':::: IS THE AUTHOR :::');
    return next();
  }

  //? Check if the requested chapter is chapter 1
  let isChapter1;
  if (type == 'video') {
    isChapter1 = content.videos.indexOf(chapterId) == 0;
  } else {
    isChapter1 = content.articles.indexOf(chapterId) == 0;
  }
  if (isChapter1 == true) {
    console.log(':::: IS CHAPTER ONE :::');
    return next();
  }

  //? Check if the content is free
  if (content.price == 0) {
    console.log(':::: IS FREE :::');
    return next();
  }

  //? Confirm that the user has paid for the content
  const courseInvoice = await CourseInvoice.findOne({
    contentId,
    userId: req.user._id,
    paymentStatus: 'PAID',
  });

  if (!courseInvoice) {
    console.log(':::: HAS NOT PAID :::');
    return next(new AppError('Please complete purchase to continue', 402));
  }

  console.log(':::: HAS PAID :::');
  //? Allow access
  next();
});

exports.getTransactionHistory = asyncHandler(async (req, res, next) => {
  const transactionHistoryQuery = CourseInvoice.find({ userId: req.user._id });

  const queryProcessor = new QueryProcessor(transactionHistoryQuery, req.query, [
    'paymentStatus',
    'dateCreated',
    'invoiceRef'
  ])
    .filter()
    .sort()
    .select()
    .paginate();

    const transactionHistory = await queryProcessor.query.populate({path: 'userId contentId', select: 'firstName lastName title thumbnailUrl email'});

    res.status(200).json({
      status: 'success',
      results: transactionHistory.length,
      transactionHistory
    });
});
