const asyncHandler = require('../utils/asyncHandler');
const QueryProcessor = require('../utils/queryProcessor');
const AppError = require('../utils/appError');
const Post = require('../models/postModel');
const util = require('util')

exports.createPost = asyncHandler(async (req, res, next) => {
  const { addon } = req.query; //* addon specifies which other field apart from text the user wants to add to their post
  const userId = req.user._id;
  let { text, options, tags } = req.body;
  const poll = [];
  let newPost;
  let image;

  if (req.file) image = req.file.filename;

  console.log({ image });

  console.log(req.body);

  if (options) {
    options.forEach((el) => {
      poll.push({ option: el });
    });
  }

  if (addon == 'poll') {
    //TODO: CREATE POST WITH POLL I.E TEXT AND POLL
    console.log('::: CREATING A POLL');
    newPost = await Post.create({
      userId,
      text,
      poll,
      tags,
    });
  } else if (addon == 'image') {
    //TODO: CREATE POST WITH IMAGE I.E TEXT AND IMAGE
    console.log('::: CREATING A TEXT WITH IMAGE');
    newPost = await Post.create({
      userId,
      text,
      image,
      tags,
    });
  } else {
    //TODO: CREATE POST WITH TEXT ONLY
    console.log('::: CREATING A TEXT POST');
    newPost = await Post.create({
      userId,
      text,
      tags,
    })
  }

  if (!newPost) return next(new AppError('An Error Occured'));

  // select: 'firstName lastName profilePicture handle isVerified gender role',
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

  const post = {...newPost}
  post._doc.userId = userDetails

  console.log(`New updated post is ${post._doc}`);
  console.log(`New updated post is ${util.inspect(userDetails)}`);

  res.status(200).json({
    status: 'success',
    post: post._doc
  });
});

exports.vote = asyncHandler(async (req, res, next) => {
  console.log(req.params);

  // { pollId: '65c14a641e2de826512903ad', optionId: '65c14a641e2de826512903b2' }

  const { pollId, optionId } = req.params;
  const userId = req.user._id;

  const poll = await Post.findById(pollId);

  if (!poll) return next(new AppError('This poll does not exist', 404));

  poll.vote(userId, optionId);

  res.status(200).json({
    status: 'success',
    poll,
  });
});

exports.deletePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const targetPost = await Post.findByIdAndDelete(postId);

  console.log(targetPost);

  if (!targetPost) return next(new AppError('This post does not exist'));

  return res.status(200).json({
    status: 'success',
  });
});

exports.getPosts = asyncHandler(async (req, res, next) => {
  const postsQuery = Post.find();

  const queryProcessor = new QueryProcessor(postsQuery, req.query, [
    'likes',
    'tags',
  ])
    .filter()
    .sort()
    .select()
    .paginate();

  const posts = await queryProcessor.query.populate({
    path: 'userId',
    select: 'firstName lastName profilePicture handle isVerified gender role',
  });

  //! WORK ON LIKES BEFORE SENDING TO CLIENT

  return res.status(200).json({
    status: 'success',
    results: posts.length,
    posts,
  });
});

exports.likePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const targetPost = await Post.findById(postId);

  if (!targetPost) return next(new AppError('This post does not exist', 404));

  const likes = await targetPost.like(req.user._id);

  return res.status(200).json({
    status: 'success',
    likes
  });
});


exports.unlikePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const targetPost = await Post.findById(postId);

  if (!targetPost) return next(new AppError('This post does not exist', 404));

  const likes = await targetPost.like(req.user._id);

  return res.status(200).json({
    status: 'success',
    likes
  });
});
