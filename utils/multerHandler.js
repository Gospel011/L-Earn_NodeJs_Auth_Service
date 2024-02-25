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
    fileSize: 10 * 1024 * 1024,
    fields: 10,
  },
});

const upload = multer({
  storage,
  fileFilterDocs,
  limits: {
    files: 2,
    fileSize: 10 * 1024 * 1024,
    fields: 10,
  },
});


const uploadVideo = multer({
  storage,
  fileFilterVideo,
  limits: {
    files: 1,
    fileSize: 300 * 1024 * 1024,
    fields: 10,
  },
});

const getProfilePicture = uploadDocs.single('profilePicture'); //? FOR PROFILE PICTURE
const getThumbnail = uploadDocs.single('thumbnail'); //? FOR TUTORIAL THUMBNAIL
const getImage = uploadDocs.single('image'); //? FOR POST
const getVideo = uploadVideo.single('video'); //? FOR POST

const uploadImageFromBuffer = async (req, cb, buffer) => {
  const public_id = `${req.user._id}/user-${req.user._id.toString().slice(-6)}-${Math.round(
    Math.random() * 1e9
  )}-${Date.now()}`;
  cloudinary.uploader
    .upload_stream(
      {
        resource_type: 'image',
        public_id: `learn/users/${public_id}`,
      },
      (error, result) => {
        cb(error, result);
      }
    )
    .end(buffer || req.file.buffer);
};

const uploadVideoFromBuffer = async (req, cb) => {
  const public_id = `user-${req.user._id.toString().slice(-6)}-${Math.round(
    Math.random() * 1e9
  )}-${Date.now()}`;
  cloudinary.uploader
    .upload_stream(
      {
        resource_type: 'video',
        public_id: `learn/videos/${public_id}`,
      },
      (error, result) => {
        cb(error, result);
      }
    )
    .end(req.file.buffer);
};

const processAndUploadMultipleImagesToCloud = asyncHandler(async (req, res, next) => {
  console.log("LATERS");
  console.log(":::; F I L E S   I S  ", req.files);

  var keys = Object.keys(req.files);

  console.log(`::: K E Y S ${keys} :::`);

  const results = keys.map(async (key) => { // Use async keyword here
    const currentFileObject = req.files[key][0];
    sharp(currentFileObject.buffer).jpeg({ quality: 100 }).toFormat('jpeg');

    // Wrap the uploadImageFromBuffer function in a promise
    return new Promise((resolve, reject) => {
      uploadImageFromBuffer(req, (error, result) => {
        if (error) {
          console.error(error);
          reject(new AppError('Failed to upload image'));
        } else {
          console.log(result);
          // console.log('SECURE URL FROM UPLOAD STREAM', result.secure_url);
          currentFileObject.filename = result.secure_url;
          resolve(); // Resolve the promise
        }
      }, currentFileObject.buffer);
    });
  });

  await Promise.all(results);

  next();
});


const processAndUploadImageToCloud = (type) => {

  return asyncHandler(async (req, res, next) => {
    //?
    // console.log('ORIGINAL REQ URL', req.originalUrl);

    if (!req.file) return next();

    // console.log('IMAGE BUFFER', req.file.buffer);

    if (type === 'profilePicture') {
      console.log("Processed image for 'profile picture'");
      sharp(req.file.buffer)
        .resize(500, 500)
        .jpeg({ quality: 100 })
        .toFormat('jpeg');
    } else if (type === 'thumbnail') {
      console.log("Processed image for 'thumbnail'");
      sharp(req.file.buffer)
        .resize(1920, 1080)
        .jpeg({ quality: 100 })
        .toFormat('jpeg');
    } else if (type === 'image') {
      console.log("Processed image for 'post'");
      sharp(req.file.buffer).jpeg({ quality: 100 }).toFormat('jpeg');
    }

    console.log('CLOUDINARY UPLOAD FILE', req.file);

    //* HANDOLE VIDEO UPLOAD TO CLOUDINARY
    if (type == "video") {
      await uploadVideoFromBuffer(req, (error, result) => {
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
      await uploadImageFromBuffer(req, (error, result) => {
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
  processAndUploadMultipleImagesToCloud,
  upload,
  getThumbnail,
  getImage,
  getVideo,
};
