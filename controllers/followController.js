const Follow = require('../models/followModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const QueryProcessor = require('../utils/queryProcessor');



exports.followUser = asyncHandler(async (req, res, next) => {
    console.log("FOLLOW PARAMS:", req.params );

    const { id } = req.params; // id of user to follow

    if (!id) return next(new AppError("This user does not exist", 400)); // throw an error if the request doesn't have an id as a route parameter

    if (id == req.user._id) next(new AppError("You may not follow yourself", 400)); // throw an error if the user wants to follow himself

    const userToFollow = await User.findById(id); // find the user to follow

    if(!userToFollow) return next(new AppError("This user does not exist", 404)); // throw an error if the user does not exist

    const hasFollowed = await Follow.findOneAndDelete({ // check if the current user has already followed the person he is requesting to follow
        userId: req.user._id,
        userToFollow: userToFollow._id
    });

    console.log("HAS FOLLOWED", hasFollowed);

    if (hasFollowed) { // unfollow user if he has already been followed by the current user
    userToFollow.followers -= 1;
    userToFollow.save();
    res.status(200).json({
        status: "success",
        message: "user unfollowed successfully"
    })

    return;
        
    }

    const follow = await Follow.create({ // create the user
        userId: req.user._id,
        userToFollow: userToFollow._id
    });

    userToFollow.followers += 1; // update the user to follow follower count
    userToFollow.save(); // save the update

    res.status(200).json({ // send a successful response back to the client
        status: "success",
        message: "user followed successfully"
    })

})

