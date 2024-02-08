const asyncHandler = require('../utils/asyncHandler');
const CourseInvoice = require('../models/courseInvoiceModel');
const User = require('../models/userModel');
const Content = require('../models/contentModel');

exports.registerPayment = asyncHandler(async (req, res, next) => {
  console.log(`::: R E Q U E S T URL: ${req.originalUrl}`);

  const paymentInfo = req.body;
  console.log('Payment recievied from webhook', paymentInfo);
  const paymentReference = paymentInfo.eventData.paymentReference;
  const paidOn = paymentInfo.eventData.paidOn;
  const amountPaid = paymentInfo.eventData.amountPaid;
  const paymentStatus = paymentInfo.eventData.paymentStatus;
  const paymentMethod = paymentInfo.eventData.paymentMethod;

  console.log(":::: L O G G I N G    T R A N S A C T I O N    D E T A I L S");
  console.log({ paymentReference }, { paidOn }, { amountPaid }, { paymentStatus }, { paymentMethod })

  const targetInvoice = await CourseInvoice.findOneAndUpdate(
    {
      invoiceRef: paymentReference,
    },
    { paidOn, amountPaid, paymentStatus, paymentMethod },
    { runValidators: true, returnDocument: 'after' }
  )//.populate({path: 'contentId', select: 'userId'});

  
  console.log({targetInvoice})
  const contentAuthorId = targetInvoice.authorId;
  const contentAuthor = await User.findById(contentAuthorId).select('+monthlyProfit');
  contentAuthor.addIncomePercentage(amountPaid);
  
  //TODO: UPDATE STUDENT COUNT IN THE CONTENT
  const contentId = targetInvoice.contentId;
  const content = await Content.findById(contentId);
  content.students.push(targetInvoice.userId);
  

  

  console.log({targetInvoice});

  if(!targetInvoice) return next(new AppError("The invoice was not found"))



  res.status(200).json({
    status: 'recieved',
    contentAuthor
  });
});
