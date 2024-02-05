const asyncHandler = require('../utils/asyncHandler');
const Review = require('../models/reviewModel');
const Content = require('../models/contentModel');
const QueryProcessor = require('../utils/queryProcessor');
const AppError = require('../utils/appError');

exports.addNewReview = asyncHandler(async (req, res, next) => {
  console.log(req.params);
  const { review, rating } = req.body;
  const userId = req.user._id;
  const { contentId, type } = req.params;

  // if(!type) return next(new AppError("Please specify the type of content this review is for", 400));

  const previousReview = await Review.findOne({userId, contentId});

  if (previousReview) return next(new AppError("You cannot write more than one review for a book or playlist", 400))
  if(rating){
    if (rating < 1) return next(new AppError("You must specify a non-zero rating"));
  }

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

  next();
});

//TODO: MOVE TO HELPER MIDDLEWARES
exports.updateContentReviewCount = async (req, res, next) => {
  const { contentId, type } = req.params;
  const {rating} = req.body;
  
  const content = await Content.findOne({_id: contentId});

  if(!content) {
    console.log('No content found for that id');
    return;
  }
  
  console.log(" ::: R E Q U E S T   M E T H O D: ", req.method, " :::")

  if(req.method == 'POST') {
    const sumOfRatings = (content.averageRating * content.numberOfRatings) + (rating * 1||1);
    content.numberOfRatings += 1;

    console.log({ rating, sumOfRatings, numberOfRatings: content.numberOfRatings })
    content.averageRating = (sumOfRatings / content.numberOfRatings).toFixed(1);

    content.save();
  } else if (req.method == 'PATCH' && rating) {
    const sumOfRatings = (content.averageRating * content.numberOfRatings) - req.previousRating + rating;
    
    content.averageRating = (sumOfRatings / content.numberOfRatings).toFixed(1);

    content.save();
  } 
  // else if (req.method == 'DELETE') {
  //   const sumOfRatings = (content.averageRating * content.numberOfRatings) - req.previousRating;
  //   content.numberOfRatings -= 1;

  //   content.averageRating = (sumOfRatings / content.numberOfRatings).toFixed(1);
  //   content.save();
  // }


}

exports.getAllReviews = asyncHandler(async (req, res, next) => {
  console.log(req.params);

  const { contentId } = req.params;

  let reviewsQuery = Review.find({
    contentId,
  });

  reviewsQuery = new QueryProcessor(reviewsQuery, req.query, ['rating']).filter().sort().select().paginate();
  
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

  const newReview = await Review.findOne(
    {
      userId,
      contentId,
    }
  );

  const previousRating = newReview.rating;

  if(rating > 0) {
    newReview.rating = rating;
  } else {
    return next(new AppError("You must specify a non-zero rating", 400));
  }
  if (review) {
    newReview.review = review;
  }
    
  
  res.status(200).json({
    status: 'success',
    newReview,
  });


  req.previousRating = previousRating;
  next();
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  
  
  const userId = req.user._id;
  const { contentId } = req.params;

  const targetReview = await Review.findOne({userId, contentId})

  req.previousRating = targetReview.rating;

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

  next();
});
