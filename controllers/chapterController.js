const Content = require('../models/contentModel');
const Article = require('../models/articleModel');
const Video = require('../models/videoModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const QueryProcessor = require('../utils/queryProcessor');

exports.createNewChapter = asyncHandler(async (req, res, next) => {
  console.log(`Request baseUrl: ${req.baseUrl}`, req.params);

  const contentId = req.params.contentId;
  if (!contentId)
    return next(new AppError('A chapter must be part of a content'));

  const userId = req.user._id;
  const targetContent = await Content.findOne({
    authorId: userId,
    _id: contentId,
  });

  if (!targetContent)
    return next(new AppError("There's no content with that Id", 404));

  console.log(targetContent);

  //* IF TYPE == BOOK, EXTRACT BOOK PARAMS
  let newChapter;

  if (targetContent.type === 'book') {
    const { title, content, tags } = req.body;
    const chapter = targetContent.articles.length + 1;

    newChapter = await Article.create({
      title,
      content,
      chapter,
      authorId: userId,
      contentId,
      tags,
    });

    targetContent.articles.push(newChapter._id);

    await targetContent.save();

    //* IF TYPE == VIDEO, EXTRACT VIDEO PARAMS
  } else {
    const { title, description, tags } = req.body;
    const chapter = targetContent.videos.length + 1;

    console.log({ title });

    const file = req.file;
    if (!file) return next(new AppError("You didn't upload any video", 400));
    const url = req.file.filename;

    console.log(`Filename is ${url}`);

    newChapter = await Video.create({
      authorId: userId,
      contentId,
      chapter,
      title,
      description,
      tags,
      url,
    });

    targetContent.videos.push(newChapter._id);
    await targetContent.save();
  }

  res.status(201).json({
    status: 'success',
    newChapter,
  });
});

exports.editChapter = asyncHandler(async (req, res, next) => {
  const { contentId, chapterId } = req.params;
  const { type } = req.query;

  const { title, tags } = req.body; //* both book and video
  const { content } = req.body; //* only book
  const { description } = req.body; //* only video

  let editedChapter;

  if (type.toLowerCase() == 'book') {
    //* HANDLE BOOK EDIT
    editedChapter = await Article.findOneAndUpdate(
      { contentId, _id: chapterId },
      { title, content, tags },
      { runValidators: true, returnDocument: 'after' }
    );

    console.log({ chapterId, contentId });

    console.log({ title, content, tags });

    if (!editedChapter)
      return next(new AppError('That chapter does not exist', 404));
  } else if (type.toLowerCase() == 'video') {
    // * HANDLE VIDEO EDIT
    editedChapter = await Video.findOneAndUpdate(
      { contentId, _id: chapterId },
      {
        title,
        description,
        tags,
      },
      { runValidators: true, returnDocument: 'after' }
    );
  }

  //? SEND RESPONSE BACK TO CLIENT
  res.status(200).json({
    status: 'success',
    editedChapter,
  });
});

exports.getChapters = asyncHandler(async (req, res, next) => {
  console.log(req.params, req.query);
  // { contentId: '65bd5b7bbd98230b6b4b0a6a' } { type: 'book' }
  const { contentId } = req.params;
  const { type } = req.query;

  if (!contentId) return next(new AppError('Please specify the contentId')); //!__

  console.log(req.params);

  let chapters;

  if (type == 'book') {
    chapters = Article.find({ contentId });

    // res.send({chapters})
  } else {
    chapters = Video.find({ contentId });
    console.log('Found video');
  }

  const queryProcessor = new QueryProcessor(chapters.select('title chapter type'), req.query, [])
    .sort()
    .paginate();

  chapters = await queryProcessor.query;

  res.status(200).json({
    status: 'success',
    chapters,
  });
});

exports.getChapterById = asyncHandler(async (req, res, next) => {
  // {{baseUrl}}/contents/:contentId/chapters/:chapterId?type=video

  const { type } = req.query;
  const { contentId, chapterId } = req.params;
  let chapterQuery;

  console.log(req.params);

  if (type == 'book') {
    chapterQuery = Article.findOne({ contentId, _id: chapterId });
  } else {
    chapterQuery = Video.findOne({ contentId, _id: chapterId });
  }

  chapterQuery = new QueryProcessor(chapterQuery, req.query).select();

  const chapter = await chapterQuery.query;

  if (!chapter) return next(new AppError('That chapter does not exist', 404));

  res.status(200).json({
    status: 'success',
    chapter,
  });
});

exports.deleteChapterById = asyncHandler(async (req, res, next) => {
  // {{baseUrl}}/contents/:contentId/chapters/:chapterId?type=video

  //* contentQuery, targetField, idToDelete

  const { type } = req.query;
  const { contentId, chapterId } = req.params;
  let chapter;
  let targetField;

  if (type == 'book') {
    chapter = await Article.deleteOne({ contentId, _id: chapterId });

    targetField = 'articles';
    req.model = Article;
  } else if (type == 'video') {

    chapter = await Video.deleteOne({ contentId, _id: chapterId });
    targetField = 'videos';
    req.model = Video;
  }

  if (chapter.deletedCount == 0)
    return next(new AppError('That chapter does not exist', 404));

  const contentQuery = Content.findOne({ _id: contentId });
  const idToDelete = chapterId;

  req.contentQuery = contentQuery;
  req.targetField = targetField;
  req.idToDelete = idToDelete;

  res.status(200).json({
    status: 'success',
  });

  next();
});

