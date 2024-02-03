const asyncHandler = require('../utils/asyncHandler');
const Article = require('../models/articleModel');
const Post = require('../models/postModel');
const Video = require('../models/videoModel');
const Comment = require('../models/commentModel');
const QueryProcessor = require('../utils/queryProcessor');
const AppError = require('../utils/appError');

exports.addComment = asyncHandler(async (req, res, next) => {
  console.log(req.params);

  const { comment } = req.body;
  const userId = req.user._id;
  const { chapterId, postId } = req.params;
  const { type } = req.query;
  let newComment;

  if (!type) return next(new AppError('Please specify a valid type', 400));

  let targetChapter;

  switch (type.toLowerCase()) {
    case 'book':
      targetChapter = await Article.findById(chapterId);

      if (!targetChapter)
        return next(new AppError('This article no longer exists'));

      newComment = await Comment.create({
        userId,
        articleId: chapterId,
        comment,
      });

      targetChapter.comments.push(newComment._id);
      await targetChapter.save();
      break;
    case 'video':
      targetChapter = await Video.findById(chapterId);
      console.log({ targetChapter });
      if (!targetChapter)
        return next(new AppError('This video no longer exists'));

      newComment = await Comment.create({
        userId,
        videoId: chapterId,
        comment,
      });

      targetChapter.comments.push(newComment._id);
      await targetChapter.save();
      break;
    case 'post':
      targetChapter = await Post.findById(chapterId);
      if (!targetChapter)
        return next(new AppError('This post no longer exists'));
      newComment = await Comment.create({
        userId,
        postId: postId,
        comment,
      });

      targetChapter.comments.push(newComment._id);
      await targetChapter.save();
      break;
    default:
      return next(new AppError('Please specify a valid type')); //!__
  }

  res.status(200).json({
    status: 'success',
    newComment,
  });
});

exports.getAllComments = asyncHandler(async (req, res, next) => {
  console.log(req.params);

  const { chapterId } = req.params;
  const { type } = req.query;

  let commentsQuery;

  if (type.toLowerCase() == 'book') {
    commentsQuery = Comment.find({ articleId: chapterId });
  } else if (type.toLowerCase() == 'video') {
    commentsQuery = Comment.find({ videoId: chapterId });
  } else if (type.toLowerCase() == 'post') {
    commentsQuery = Comment.find({ articleId: chapterId });
  } else {
    return next(new AppError('Please provide a valid type.'));
  }

  commentsQuery = new QueryProcessor(commentsQuery, req.query, [])
    .sort()
    .select()
    .paginate();

  const comments = await commentsQuery.query;

  res.status(200).json({
    status: 'success',
    results: comments.length,
    comments,
  });
});

exports.editComment = asyncHandler(async (req, res, next) => {
  console.log(req.params);

  const { comment } = req.body;
  const userId = req.user._id;
  const { commentId } = req.params;
  const { type } = req.query;

  const newComment = await Comment.findOneAndUpdate(
    {
      userId,
      _id: commentId,
    },
    { comment },
    { runValidators: true, returnDocument: 'after' }
  );

  if (!newComment) return next(new AppError('The requested comment does not exit', 404));

  res.status(200).json({
    status: 'success',
    newComment,
  });
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
  console.log(req.params);

  const { comment } = req.body;
  const userId = req.user._id;
  const { commentId } = req.params;
  const { type } = req.query;

  const newComment = await Comment.findOneAndDelete(
    {
      userId,
      _id: commentId,
    },
    { comment },
    { runValidators: true, returnDocument: 'after' }
  );

  if (!newComment) return next(new AppError('The requested comment does not exit', 404));

  res.status(200).json({
    status: 'success',
  });
});

// exports.editReview = asyncHandler(async (req, res, next) => {
//   console.log(req.params);
//   const { review, rating } = req.body;
//   const userId = req.user._id;
//   const { contentId } = req.params;

//   const newReview = await Review.findOneAndUpdate(
//     {
//       userId,
//       contentId,
//     },
//     { review, rating },
//     { runValidators: true, returnDocument: 'after' }
//   );

//   res.status(200).json({
//     status: 'success',
//     newReview,
//   });
// });

// exports.deleteReview = asyncHandler(async (req, res, next) => {

//   const userId = req.user._id;
//   const { contentId } = req.params;

//   const result = await Review.findOneAndDelete(
//     {
//       userId,
//       contentId,
//     },
//   );

// //   console.log({result})
//   if (!result) {
//     console.log(result)
//     return next(new AppError("The required review deos not exist", 404));
//   }

//   res.status(200).json({
//     status: 'success',
//   });
// });
