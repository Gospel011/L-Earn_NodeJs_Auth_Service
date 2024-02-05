const asyncHandler = require('../utils/asyncHandler');
const Reply = require('../models/replyModel');
const Post = require('../models/postModel');
const Video = require('../models/videoModel');
const Comment = require('../models/commentModel');
const QueryProcessor = require('../utils/queryProcessor');
const AppError = require('../utils/appError');

/**
 * This controller adds a new reply to a comment whose id has been specified in the request route parameters
 */
exports.replyComment = asyncHandler(async (req, res, next) => {

  const { commentId } = req.params
  const { reply } = req.body;

  if(!commentId) return next(new AppError("Please specify which comment this reply is for", 400));

  const newReply = await Reply.create({
    userId: req.user._id,
    commentId,
    reply
  });

  const targetComment = await Comment.findById(commentId);
  targetComment.addReply(newReply._id);

  res.status(200).json({
    status: 'success',
    newReply,
  });
});

/**
 * This controller gets all the replies of a particular comment whose id is specified in the
 * request route paramenter;
 */
exports.getAllReplies = asyncHandler(async (req, res, next) => {
  console.log(req.params);

  const { commentId } = req.params;
  let replies;

  const replyQuery = Reply.find({commentId});

  const queryProcessor = new QueryProcessor(replyQuery, req.query, []).filter().sort().select().paginate();

  replies = await queryProcessor.query;


  res.status(200).json({
    status: 'success',
    results: replies.length,
    replies,
  });
});

/**
 * This controller is used to edit a repl whose id is specified in the request route parameter.
 */
exports.editReply = asyncHandler(async (req, res, next) => {
  console.log(req.params);

  const { reply } = req.body;
  const userId = req.user._id;
  const { replyId } = req.params;

  console.log(req.params, req.body);
  

  const newReply = await Reply.findOneAndUpdate(
    {
      userId,
      _id: replyId,
    },
    { reply },
    { runValidators: true, returnDocument: 'after' }
  );

  if (!newReply) return next(new AppError('The requested reply does not exit', 404));

  res.status(200).json({
    status: 'success',
    newReply,
  });
});


/**
 * This controller deletes the reply whose id is specified in the request route parameters and
 * also deletes it in the comment that is referencing it
 */
exports.deleteReply = asyncHandler(async (req, res, next) => {
  
  const userId = req.user._id;
  const { commentId, replyId } = req.params;


  //* DELETE REPLY
  const deletedReply = await Reply.findOneAndDelete({_id: replyId, userId});
  console.log(deletedReply);

  //* REMOVE REPLY FROM [REPLIES] IN COMMENT
  const targetComment = await Comment.findById(commentId);
  targetComment.deleteReply(replyId);


  res.status(200).json({
    status: "success"
  })
});

exports.likeReply = asyncHandler(async (req, res, next) => {

  const replyId = req.params.replyId;

  if(!replyId) return next(new AppError("Couldn't like reply"));

  const targetReply = await Reply.findOne({_id: req.params.replyId});
  targetReply.like();

  res.status(200).json({
    status: "success"
  })

})

exports.unlikeReply = asyncHandler(async (req, res, next) => {

  const replyId = req.params.replyId;

  if(!replyId) return next(new AppError("Couldn't like reply"));

  const targetReply = await Reply.findOne({_id: req.params.replyId});
  targetReply.unlike();

  res.status(200).json({
    status: "success"
  })

})