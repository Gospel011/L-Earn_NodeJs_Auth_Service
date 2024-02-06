const asyncHandler = require('../utils/asyncHandler');

exports.registerPayment = asyncHandler(async (req, res, next) => {

    console.log("Payment recievied", req.body);

    res.status(200).json({
        status: "recieved"
    });
});
