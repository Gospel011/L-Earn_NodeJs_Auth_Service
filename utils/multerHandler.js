const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('./cloudinary');
const asyncHandler = require('./asyncHandler')

const AppError = require('./appError');

const storage = multer.memoryStorage();

const fileFilter = function (req, file, cb) {
  const permittedExtentions = ['png', 'jpg', 'jpeg', 'mp4', 'pdf'];
  const ext = file.mimetype.split('/')[1];
  console.log('EXTENSION', ext, file);

  if (permittedExtentions.includes(ext) ) return cb(null, true);
  else cb(new AppError(`.${file.originalname.split('.')[1]} files are not allowed`));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 1,
    fileSize: 10 * 1024 * 1024,
    fields: 6,
    //parts: 7,
  },
});

const getProfilePicture = upload.single('profilePicture');

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

const processAndUploadImageToCloud = asyncHandler(async (req, res, next) => {
  console.log('ORIGINAL REQ URL', req.originalUrl);

  if (!req.file) return next();

  console.log('IMAGE BUFFER', req.file.buffer);

  await sharp(req.file.buffer)
    .resize(500, 500)
    .jpeg({ quality: 100 })
    .toFormat('jpeg');

  console.log('CLOUDINARY UPLOAD FILE', req.file);

  uploadImageFromBuffer(req, (error, result) => {
    if (error) {
      console.error(error);
      return next(new AppError('Failed to upload image'));
    } else {
      console.log(result);
      console.log('SECURE URL FROM UPLOAD STREAM', result.secure_url);
      req.file.filename = result.secure_url;
      next();
    }
  });
})

module.exports = { getProfilePicture, processAndUploadImageToCloud };
