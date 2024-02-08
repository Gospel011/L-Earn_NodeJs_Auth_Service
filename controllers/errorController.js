module.exports = (err, req, res, next) => {

  // console.log("In error block: ", err.message);

  // TODO: DELETE RESOURCE FROM CLOUDINARY IF CONTENT CREATION FAILED
  if(req.file) console.log('::::: FILENAME FROM ERROR CONTROLLER ::: ', req.file.filename);

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
      
  } else if (err.statusCode == 503) {
    res.status(err.statusCode).json({
      status: 'fail',
      message: 'Your request couldn\'t be completed, please try again after a few minutes'
    })
  }
  else {
    res.status(err.statusCode || 500).json({
        status: 'fail',
        message: 'Something went wrong. Please contact us with a description of what you were doing before you saw this message.',
      });
  }

  
  
      console.log('Error message 🔥📩🔥🧯🚒', err.message);
      console.log('Error stack 🔥📜📰', err.stack);
      console.log("Error 🔥🔥🔥", err)
      console.log("STATUS CODE 🔥🔥🔥", err.stausCode)
  


  next();
};
