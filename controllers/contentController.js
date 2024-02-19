const asyncHandler = require('../utils/asyncHandler');
const Content = require('../models/contentModel');
const QueryProcessor = require('../utils/queryProcessor');
const CourseInvoice = require('../models/courseInvoiceModel')
const AppError = require('../utils/appError');
const util = require('util');

/**
 * ? CREATE NEW CONTENT
 * This route creates a new Vidweo or Book, awaiting
 */
exports.createNewContent = asyncHandler(async (req, res, next) => {
  //* GET TUTORIAL TITLE AND DESCRIPTION FROM BODY
  const { title, description, tags } = req.body;
  const { type } = req.query;
  console.log(`::: C O N T E N T  Q U E R Y IS ${util.inspect(req.query)}`);


  let { price } = req.body;

  //* GET THUMBNAIL URL FROM REQ.FILE.FILENAME
  const file = req.file;
  let filename;

  if (file) {
    filename = file.filename;
    console.log('::: F I LNAME IS ' + filename);
  } else {
    next(
      new AppError(
        `Please provide a thumbnail for your ${
          type != undefined ? type.toLowerCase() : 'content'
        }, this is what users would see when scrolling through the Learn page`,
        400
      )
    );
  }

  console.log('Your tutorial is named ', title);

  console.log('Your tutorial decription is: ', description);

  if (price) {
    price = price * 1;
  }

  console.log('Price: ', price);

  //* EXTRACT THUMBNAIL
  const thumbnailUrl = filename;
  console.log('Your tutorial thumbnail is ', thumbnailUrl);

  //? [CREATE] NEW TUTORIAL
  const newTutorial = await Content.create({
    type,
    authorId: req.user._id,
    title,
    description,
    thumbnailUrl,
    price,
    tags,
  });

  console.log('Tutorial created');
  

  res.status(201).json({
    status: 'success',
    newTutorial,
  });
});

/**
 * ? EDIT CONTENT
 * This controller is used to edith the content the user posted.
 */
exports.editContent = asyncHandler(async (req, res, next) => {
  //* GET CONTENT ID FROM THE BODY
  const { title, description, tags } = req.body;

  const contentId = req.params.id;
  if (!contentId) throw new Error("Invalid contentId");
  console.log(`Content id is ${contentId}`);

  let price;

  if (req.body.price) {
    price = req.body.price * 1;
  }

  if (contentId == ':id') {
    return next(
      new AppError('Please provide the id of the content you want to edit', 400)
    );
  }

  //* GET THUMBNAIL URL FROM REQ.FILE.FILENAME IF SPECIFIED
  const file = req.file;
  let filename;

  if (file) {
    filename = file.filename;
    console.log('::: F I LNAME IS ' + filename);
  }

  const targetContent = await Content.findOneAndUpdate(
    {_id: contentId, authorId: req.user._id},
    { title, description, tags, price, thumbnailUrl: filename },
    { runValidators: true, returnDocument: 'after' }
  );

  if (!targetContent) return next(new AppError("You do not have such content", 404))

  res.status(200).json({
    status: 'success',
    targetContent,
  });
});

/**
 * ? GET CONTENT BY ID
 * This controller retrieves one document by it's id. If no document is found,
 * it returns a 404 error message
 */
exports.getContentById = asyncHandler(async (req, res, next) => {
  //* EXTRACT THE ID PATH VARIABLE
  const { id } = req.params;

  

  console.log('Params: ', req.params);


  const content = await Content.findById(id).populate({
    path: 'authorId videos articles',
    // select: 'firstName lastName followers profilePicture handle isVerified gender role title chapter',
  });

  if (!content) {
    console.log("In if block");
    return next(new AppError('The requested content does not exist', 404));
  }
  
  console.log(`Foundby id: ${id} ${!content}`);
  return res.status(200).json({
    status: 'success',
    content,
  });
});


/**
 * ? GET ALL CONTENT
 * This controller is responsible for retriving all the contents in the database.
 * If one or more query parameters is specified, it returns the documents that
 * match the query.
 */
exports.getAllContent = asyncHandler(async (req, res, next) => {

  console.log("req.userContents: ", req.userContents);

  const queryProcessor = new QueryProcessor(req.userContents || Content.find(), req.query)
    .filter()
    .sort()
    .select()
    .paginate();

  
  const contents = await queryProcessor.query.populate({
    path: 'authorId',
    // select: 'firstName lastName followers profilePicture handle isVerified gender role title chapter',
  });

  res.status(200).json({
    status: 'success',
    results: contents.length,
    contents,
  });
});

/**
 * ? GET CONTENT BY ID
 * This controller retrieves one document by it's id. If no document is found,
 * it returns a 404 error message
 */
exports.deleteContentById = asyncHandler(async (req, res, next) => {
  //* EXTRACT THE ID PATH VARIABLE
  
  console.log('Params: ', req.params);
  const { id } = req.params;


  


  console.log(`Finding by id: ${id}`);

  const content = await Content.findOneAndDelete({_id: id, authorId: req.user._id});

  // TODO: DELETE THE VIDEOS OR ARTICLES IN THE CONTENT AS WELL.

  if(!content) {
    return next(new AppError("There is no such content", 404));
  }

  res.status(200).json({
    status: 'success',
  });
});

/**
 * ? GET MY CONTENTS
 * This route gets all the content having the current authorId, then attaches it
 * to the request object for the [getAllContents] controller to continue processing
 */
exports.getMyContents = asyncHandler(async (req, res, next) => {

  req.userContents = Content.find({authorId: req.user._id})

  console.log("REQ. USER CONTENTS = ${req.userContents)")


  next();
})
/**
 * ? GET MY PURCHASED CONTENTS
 * This route gets all the content having the current authorId, then attaches it
 * to the request object for the [getAllContents] controller to continue processing
 */
exports.getMyPurchasedContents = asyncHandler(async (req, res, next) => {

  // req.userContents = Content.find({authorId: req.user._id})

  // console.log("REQ. USER CONTENTS = ${req.userContents)")
  const aggregatedContents = await CourseInvoice.aggregate([
    {
      $match: {userId: {$eq: req.user._id}}
    }
    // {
    //   $project: {
    //     contentId: '',
    //     _id: 0
    //   }
    // }
  ])

  const contents = aggregatedContents.map(el => el.contentId)

  req.userContents = Content.find({_id: {$in: contents}});

  // res.status(200).json({userContents})


  next();
})