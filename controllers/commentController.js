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

        console.log("COMMENTS =", req.body)

      newComment = await Comment.create({
        userId,
        videoId: chapterId,
        comment,
      });

      targetChapter.comments.push(newComment._id);
      await targetChapter.save();
      break;
    case 'post':
      targetPost = await Post.findById(postId);
      if (!targetPost)
        return next(new AppError('This post no longer exists'));
      console.log(req.body);

      

      newComment = await Comment.create({
        userId,
        postId: postId,
        comment,
      });

      


      targetPost.comments.push(newComment._id);
      await targetPost.save();
      break;
    default:
      return next(new AppError('Please specify a valid type')); //!__
  }

  const userDetails = {
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    profilePicture: req.user.profilePicture,
    handle: req.user.handle,
    isVerified: req.user.isVerified,
    gender: req.user.gender,
    role: req.user.role,
    _id: userId
  }

  newComment = {...newComment}
  newComment._doc.userId = userDetails

  res.status(200).json({
    status: 'success',
    newComment: newComment._doc,
  });
});

exports.getAllComments = asyncHandler(async (req, res, next) => {
  console.log(req.params);

  const { chapterId, postId } = req.params;
  const { type } = req.query;

  let commentsQuery;

  if (type.toLowerCase() == 'book') {
    commentsQuery = Comment.find({ articleId: chapterId });
  } else if (type.toLowerCase() == 'video') {
    commentsQuery = Comment.find({ videoId: chapterId });
  } else if (type.toLowerCase() == 'post') {
    commentsQuery = Comment.find({ postId });
  } else {
    return next(new AppError('Please provide a valid type.'));
  }

  console.log({query: req.query})
  commentsQuery = new QueryProcessor(commentsQuery, req.query, [])
    .sort()
    .select()
    .paginate();

  const comments = await commentsQuery.query.populate({
    path: 'userId',
    select: 'firstName lastName profilePicture handle isVerified gender role',
  });

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
  const { commentId, contentId, chapterId, postId } = req.params;
  const { type } = req.query;

  if (!type) return next(new AppError("Please specify the type of content you want to delete this comment for")) //!_

  if(type == 'post' && !postId) return next(new AppError('Please specify the post this comment belongs to'));
  if(type == 'video' || type == 'book' && !contentId) return next(new AppError('Please specify the content this comment belongs to'));
  

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


  console.log("type is video", type.toLowerCase() == 'video')
  
  if (type.toLowerCase() == 'video') {
    req.contentQuery = Video.findOne({_id: chapterId, contentId});
    req.model = Video;

    console.log("Would delete comment in video model");

  } else if ( type.toLowerCase() == 'book'){
    req.contentQuery = Article.findOne({_id: chapterId, contentId});
    req.model = Article;
    
  } else if( type.toLowerCase() == 'post') {
    
    const post = await Post.findOne({_id: postId});
    post.deleteComment(req.user._id);

    
    
  } else {
    return next( new AppError("Invalid type", 400));
  }
  
  //* contentQuery, targetField, idToDelete
  req.targetField = 'comments';
  req.idToDelete = commentId;

  next();  
});



exports.likeComment = asyncHandler(async (req, res, next) => {

  const {commentId} = req.params;

  if(!commentId) return next(new AppError("Couldn't like comment"));

  const targetComment = await Comment.findOne({_id: commentId});
  
  if(!targetComment) return next(new AppError("This comment does not exis", 404));
  const likes = targetComment.like(req.user._id);

  res.status(200).json({
    status: "success",
    likes: likes
  })

})



exports.unlikeComment = asyncHandler(async (req, res, next) => {

  const {commentId} = req.params;

  if(!commentId) return next(new AppError("Couldn't like comment"));

  const targetComment = await Comment.findOne({_id: commentId});
  targetComment.unlike();

  res.status(200).json({
    status: "success",
    likes: targetComment.likes
  })

})
