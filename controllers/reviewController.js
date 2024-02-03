const asyncHandler = require('../utils/asyncHandler');

exports.addNewReview = asyncHandler(async (req, res, next) => {
    console.log(req.params)
    res.status(200).json({
        status: "success",
        message: "still in development"
    });
})