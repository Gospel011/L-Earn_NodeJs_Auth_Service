module.exports = (err, req, res, next) => {

  // console.log("In error block: ", err.message);

  // TODO: DELETE RESOURCE FROM CLOUDINARY IF CONTENT CREATION FAILED
  if(req.file) {
    console.log('::::: FILENAME FROM ERROR CONTROLLER ::: ', req.file.filename);
  //   cloudinary.v2.api
  // .delete_resources(['learn/videosuser-ffb316-393139124-1707443401817'], 
  //   { type: 'upload', resource_type: 'video' })
  // .then(console.log);
  }

    //? SEND OPERATIONAL MESSAGES
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: 'fail',
      message: err.message,
    });

    //? SEND VALIDATION ERROR MESSAGES
  } else if (err.name == "ValidationError") {
    res.status(err.statusCode || 400).json({
        status: 'fail',
        message: err.errors[Object.keys(err.errors)[0]].message,
      });

      //? SEND DUPLICATE CREATION ERROR MESSAGES
  } else if (err["code"] == 11000) {
    const keyValues = Object.keys(err.keyValue);
    res.status(err.statusCode || 400).json({
        status: 'fail',
        message: keyValues[0] == "handle" ? "This handle has already been chosen" : 'You already have an account. Please login with your email and password.'
      });
      
  } else if (err.message.includes('503')) {
    res.status(503).json({
      status: 'fail',
      message: 'Your request couldn\'t be completed, please try again after a few minutes'
    })
  } else if (err.name == 'CastError') {
    const model = err.message.split('model')[1]
    res.status(err.statusCode || 500).json({
      status: 'fail',
      err,
      message: `Invalid ${model.toLowerCase()} id`,
    });

  }
  else {
    res.status(err.statusCode || 500).json({
        status: 'fail',
        err,
        message: 'Something went wrong. Please contact us with a description of what you were doing before you saw this message.',
      });
  }

  
  
      console.log('Error message 🔥📩🔥🧯🚒', err.message);
      console.log('Error stack 🔥📜📰', err.stack);
      console.log("Error 🔥🔥🔥", err)
      console.log("STATUS CODE 🔥🔥🔥", err.stausCode)
  


  next();
};
