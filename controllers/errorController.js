module.exports = (err, req, res, next) => {

    //? SEND OPERATIONAL MESSAGES
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: 'fail',
      message: err.message,
    });

    //? SEND VALIDATION ERROR MESSAGES
  } else if (err.name == "ValidationError") {
    res.status(err.statusCode || 500).json({
        status: 'fail',
        message: err.errors[Object.keys(err.errors)[0]].message,
      });

      //? SEND DUPLICATE ERROR MESSAGES
  } else if (err["code"] == 11000) {
    res.status(err.statusCode || 500).json({
        status: 'fail',
        message: 'This user already exists',
      });
  } else {
    res.status(err.statusCode || 500).json({
        status: 'fail',
        message: 'Something went wrong',
      });
  }

  //! REMOVE IN PRODUCTION
  if(process.env.CURRENT_ENV == 'dev'){
      console.log('Error message 🔥📩🔥🧯🚒', err.message);
      console.log('Error stack 🔥📜📰', err.stack);
      console.log("Error 🔥🔥🔥", err)
  }


  next();
};
