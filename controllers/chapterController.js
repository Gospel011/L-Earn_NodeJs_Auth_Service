const Content = require('../models/contentModel');
const Article = require('../models/articleModel');
const Video = require('../models/videoModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

exports.createNewChapter = asyncHandler(async (req, res, next) => {
  console.log(`Request baseUrl: ${req.baseUrl}`, req.params);

  const contentId = req.params.contentId;
  if (!contentId)
    return next(new AppError('A chapter must be part of a content'));

  const userId = req.user._id;
  const targetContent = await Content.findOne({
    userId: userId,
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
      userId,
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
      userId,
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
  const { contentId, chapterId, chapter } = req.params;
  const { type } = req.query;

  let title, content, tags;
  let description, url;
  let editedBook;

  if (type.toLowerCase() == 'book') {
    //TODO: HANDLE BOOK EDIT
    editedBook = await Article.findByIdAndUpdate(
      chapterId,
      { title, content, tags },
      { runValidators: true, returnDocument: 'after' }
    );

    if (!editedBook) return next(new AppError("That chapter does not exist", 404));

    res.status(200).json({
      status: "success",
      editedBook
    })
  } else if (type.toLowerCase() == 'video') {
    // TODO: HANDLE VIDEO EDIT
  }

  //? Get the current article corresponding to the chapterId
  res.status(200).send({
    status: 'success',
    message: 'still in development',
  });
});
