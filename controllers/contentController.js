const asyncHandler = require('../utils/asyncHandler');
const Content = require('../models/contentModel');
const Article = require('../models/articleModel');
const AppError = require('../utils/appError');

/**
 * This route creates a new Vidweo or Book, awaiting
 */
exports.createNewContent = asyncHandler(async (req, res, next) => {
  //* GET TUTORIAL TITLE AND DESCRIPTION FROM BODY
  const { title, description, type, tags } = req.body;
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

exports.editContent = asyncHandler(async (req, res, next) => {
  //* GET CONTENT ID FROM THE BODY
  const { contentId, title, description, tags } = req.body;
  console.log(`Content id is ${contentId}`);

  let price;

  if (req.body.price) {
    price = req.body.price * 1;
  }

  if (!contentId) {
    return next(
      new AppError('Please provide the id of the content you want to edit')
    );
  }

  //* GET THUMBNAIL URL FROM REQ.FILE.FILENAME IF SPECIFIED
  const file = req.file;
  let filename;

  if (file) {
    filename = file.filename;
    console.log('::: F I LNAME IS ' + filename);
  }

  const targetContent = await Content.findByIdAndUpdate(
    contentId,
    { title, description, tags, price, thumbnailUrl: filename },
    { runValidators: true, returnDocument: 'after' }
  );

  res.status(200).json({
    status: 'success',
    targetContent,
  });
});

exports.getContentById = asyncHandler(async (req, res, next) => {
  //* EXTRACT THE ID PATH VARIABLE
  const { id } = req.params;

  let content;

  console.log('Params: ', req.params);

  console.log(`Finding by id: ${id}`);

  content = await Content.findById(id);

  if (!content) {
    return new AppError('The requested content does not exist', 404);
  }

  res.status(200).json({
    status: 'success',
    content,
  });
});

/**
 * @param {Object} query: this is the result of Model.find for example
 * @param {Object} queryObject: this is the object containing the clients query parameters
 * @param {Array} allowedFields: this is the array of allowed fields that'll be used to filter the query
 */
class QueryProcessor {
  constructor(query, queryObject, allowedFields) {
    this.query = query;
    this.queryObject = queryObject;
    this.allowedFields = allowedFields;
  }

  filter() {
    let parsedQueryObject = {};

    // add $ in front of (gte|gt|lte|lt)

    Object.keys(this.queryObject).forEach((el) => {
      console.log('Current el: ', el);
      console.log(this.allowedFields.includes(el));

      if (this.allowedFields.includes(el)) {
        console.log('In');

        parsedQueryObject[el] = this.queryObject[el];
      }
    });

    parsedQueryObject = JSON.parse(
      JSON.stringify(parsedQueryObject).replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      )
    );
    console.log(this.queryObject, parsedQueryObject);

    //* FILTER BY TYPE
    this.query = Content.find(parsedQueryObject);
    return this;
  }

  sort() {
    let sort = '-averageRating -dateCreated';

    //* SORT BY PRICE, DATE CREATED
    if (this.queryObject.sort) {
      sort = this.queryObject.sort.split(/,\s?/).join(' ');

      console.log(`Sort string = ${sort}`);
    }
    this.query = this.query.sort(sort);
    return this;
  }

  select() {
    let fields = '-__v';

    if (this.queryObject.fields) {
      console.log('Fields in query object');
      fields = this.queryObject.fields.split(', ').join(' ');
    }
    this.query = this.query.select(fields);
    return this;
  }

  paginate() {
    let page = this.queryObject.page * 1 || 1;
    let limit = this.queryObject.limit * 1 || 20;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

exports.getAllContent = asyncHandler(async (req, res, next) => {
  const queryProcessor = new QueryProcessor(this.query, req.query, [
    'type',
    'price',
  ])
    .filter()
    .sort()
    .select()
    .paginate();

  // let parsedQueryObject = {};

  // // add $ in front of (gte|gt|lte|lt)

  // Object.keys(queryObject).forEach((el) => {
  //   console.log('Current el: ', el);
  //   console.log(allowedFields.includes(el));

  //   if (allowedFields.includes(el)) {
  //     console.log('In');
  //     if (el == 'price') {
  //       console.log(':::converting to int');
  //       parsedQueryObject[el] = queryObject[el];
  //     } else {
  //       parsedQueryObject[el] = queryObject[el];
  //     }
  //   }
  // });

  // parsedQueryObject = JSON.parse(
  //   JSON.stringify(parsedQueryObject).replace(
  //     /\b(gte|gt|lte|lt)\b/g,
  //     (match) => `$${match}`
  //   )
  // );
  // console.log(queryObject, parsedQueryObject);

  // //* FILTER BY TYPE
  // let query = Content.find(parsedQueryObject);

  // let sort = '-averageRating, -dateCreated';

  // //* SORT BY PRICE, DATE CREATED
  // if (req.query.sort) {
  //   sort = req.query.sort.split(', ').join(' ');

  //   console.log(`Sort string = ${sort}`);
  // }
  // query = query.sort(sort);

  //* LIMIT FIELDS SENT BACK TO THE CLIENT

  // let fields = '-__v';

  // if (req.query.fields) {
  //   fields = req.query.fields.split(', ').join(' ');
  // }
  // query = query.select(fields);

  //* PAGINATE RESULTS
  // let page = req.query.page * 1 || 1;
  // let limit = req.query.limit * 1 || 2;
  // const skip = (page - 1) * limit;

  // query = query.skip(skip).limit(limit);

  const contents = await queryProcessor.query;

  res.status(200).json({
    status: 'success',
    results: contents.length,
    contents,
  });
});
