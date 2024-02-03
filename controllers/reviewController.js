const asyncHandler = require('../utils/asyncHandler');
const Review = require('../models/reviewModel');
const QueryProcessor = require('../utils/queryProcessor');
const AppError = require('../utils/appError');

exports.addNewReview = asyncHandler(async (req, res, next) => {
  console.log(req.params);
  const { review, rating } = req.body;
  const userId = req.user._id;
  const { contentId } = req.params;

  const previousReview = await Review.findOne({userId, contentId});

  if (previousReview) return next(new AppError("You cannot write more than one review for a book or playlist", 400))

  const newReview = await Review.create({
    userId,
    contentId,
    review,
    rating
  });
  res.status(200).json({
    status: 'success',
    newReview,
  });
});

exports.getAllReviews = asyncHandler(async (req, res, next) => {
  console.log(req.params);

  const { contentId } = req.params;

  let reviewsQuery = Review.find({
    contentId,
  });

  reviewsQuery = new QueryProcessor(reviewsQuery, req.query, []).sort().select().paginate();
  
  const reviews = await reviewsQuery.query;

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    reviews,
  });
});

exports.editReview = asyncHandler(async (req, res, next) => {
  console.log(req.params);
  const { review, rating } = req.body;
  const userId = req.user._id;
  const { contentId } = req.params;

  const newReview = await Review.findOneAndUpdate(
    {
      userId,
      contentId,
    },
    { review, rating },
    { runValidators: true, returnDocument: 'after' }
  );
  
  res.status(200).json({
    status: 'success',
    newReview,
  });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  
  
  const userId = req.user._id;
  const { contentId } = req.params;

  const result = await Review.findOneAndDelete(
    {
      userId,
      contentId,
    },
  );

//   console.log({result})
  if (!result) {
    console.log(result)
    return next(new AppError("The required review deos not exist", 404));
  }
  
  res.status(200).json({
    status: 'success',
  });
});
