const Content = require('../models/contentModel');
const Article = require('../models/articleModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');


exports.createNewChapter = asyncHandler(async (req, res, next) => {
    console.log(`Request baseUrl: ${req.baseUrl}`, req.params);

    const contentId = req.params.contentId;
    if(!contentId) return next(new AppError("A chapter must be part of a content"));

    const targetContent = await Content.findById(contentId);

    if(!targetContent) return next(new AppError("There's no content with that Id", 404));

    console.log(targetContent);

    //* IF TYPE == BOOK, EXTRACT BOOK PARAMS
    const userId = req.user._id;
    let newChapter;

    if (targetContent.type === 'book') {
      const { title, content, tags } = req.body;
      const chapterId = targetContent.articles.length + 1;

      newChapter = await Article.create({
        title,
        content,
        chapterId,
        userId,
        contentId,
        tags
      });

      targetContent.articles.push(newChapter._id);

      await targetContent.save();

      //* IF TYPE == VIDEO, EXTRACT VIDEO PARAMS
    } else {
      const { title, description, tags } = req.body;
      const chapterId = targetContent.videos.length + 1;

      const file = req.file;
      if(!file) return next(new AppError("You didn't upload any video", 400));
      const url = req.file.filename;

      console.log(`Filename is ${url}`)

      newChapter = Video.create({
        userId,
        contentId,
        chapterId,
        title,
        description,
        tags,
        url
      });

      targetContent.videos.push(newChapter._id);
    }


    res.status(201).json({
        status: "success",
        newChapter
    })
  })