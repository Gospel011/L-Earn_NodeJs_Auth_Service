const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('./cloudinary');
const asyncHandler = require('./asyncHandler');

const AppError = require('./appError');

const storage = multer.memoryStorage();

const fileFilterDocs = function (req, file, cb) {
  const permittedExtentions = ['png', 'jpg', 'jpeg', 'pdf'];
  const ext = file.mimetype.split('/')[1];


  if (permittedExtentions.includes(ext)) return cb(null, true);
  else
    cb(
      new AppError(`.${file.originalname.split('.')[1]} files are not allowed`)
    );
};



const fileFilterVideo = function (req, file, cb) {
  const permittedExtentions = ['mkv', 'mp4'];
  console.log(':::: FILE MIME TYPE IS ' + file.mimetype + ' ::::::::');
  const ext = file.mimetype.split('/')[1];

  if (permittedExtentions.includes(ext)) return cb(null, true);
  else
    cb(
      new AppError(`.${file.originalname.split('.')[1]} files are not allowed`)
    );
};



const uploadDocs = multer({
  storage,
  fileFilterDocs,
  limits: {
    files: 1,
    fileSize: 1000 * 1024 * 1024,
    fields: 10,
    //parts: 7,
  },
});


const uploadVideo = multer({
  storage,
  fileFilterVideo,
  limits: {
    files: 1,
    fileSize: 300 * 1024 * 1024,
    fields: 10,
    //parts: 7,
  },
});

const getProfilePicture = uploadDocs.single('profilePicture'); //? FOR PROFILE PICTURE
const getThumbnail = uploadDocs.single('thumbnail'); //? FOR TUTORIAL THUMBNAIL
const getImage = uploadDocs.single('image'); //? FOR POST
const getVideo = uploadVideo.single('video'); //? FOR POST

const uploadImageFromBuffer = asyncHandler(async (req, cb) => {
  const public_id = `user-${req.user._id}-${Math.round(
    Math.random() * 1e9
  )}-${Date.now()}`;
  cloudinary.uploader
    .upload_stream(
      {
        resource_type: 'image',
        public_id: public_id,
      },
      (error, result) => {
        cb(error, result);
      }
    )
    .end(req.file.buffer);
});

const uploadVideoFromBuffer = asyncHandler(async (req, cb) => {
  const public_id = `user-${req.user._id}-${Math.round(
    Math.random() * 1e9
  )}-${Date.now()}`;
  cloudinary.uploader
    .upload_stream(
      {
        resource_type: 'video',
        public_id: public_id,
      },
      (error, result) => {
        cb(error, result);
      }
    )
    .end(req.file.buffer);
});

const processAndUploadImageToCloud = (type) => {

  return asyncHandler(async (req, res, next) => {
    //?
    // console.log('ORIGINAL REQ URL', req.originalUrl);

    if (!req.file) return next();

    // console.log('IMAGE BUFFER', req.file.buffer);

    if (type === 'profilePicture') {
      console.log("Processed image for 'profile picture'");
      await sharp(req.file.buffer)
        .resize(500, 500)
        .jpeg({ quality: 100 })
        .toFormat('jpeg');
    } else if (type === 'thumbnail') {
      console.log("Processed image for 'thumbnail'");
      await sharp(req.file.buffer)
        .resize(1920, 1080)
        .jpeg({ quality: 100 })
        .toFormat('jpeg');
    } else if (type === 'image') {
      console.log("Processed image for 'post'");
      await sharp(req.file.buffer).jpeg({ quality: 100 }).toFormat('jpeg');
    }

    console.log('CLOUDINARY UPLOAD FILE', req.file);

    //* HANDOLE VIDEO UPLOAD TO CLOUDINARY
    if (type == "video") {
      uploadVideoFromBuffer(req, (error, result) => {
        console.log("Uploading from buffer");
        if (error) {
          console.error(error);
          return next(new AppError('Failed to upload video'));
        } else {
          console.log("result", result);
          // console.log('SECURE URL FROM UPLOAD STREAM', result.secure_url);
          req.file.filename = result.secure_url;
          next();
        }
      });

      //* HANDOLE IMAGE UPLOAD TO CLOUDINARY
    } else {
      uploadImageFromBuffer(req, (error, result) => {
        if (error) {
          console.error(error);
          return next(new AppError('Failed to upload image'));
        } else {
          console.log(result);
          // console.log('SECURE URL FROM UPLOAD STREAM', result.secure_url);
          req.file.filename = result.secure_url;
          next();
        }
      });
    }
  });
};

module.exports = {
  getProfilePicture,
  processAndUploadImageToCloud,
  getThumbnail,
  getImage,
  getVideo,
};
