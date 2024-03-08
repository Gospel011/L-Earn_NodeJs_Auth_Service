const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { promisify } = require('util');

const userSchema = new mongoose.Schema({

    /**
     * ## FIRST NAME
     * @param {String} firstName This is the user's first name
     */
  firstName: {
    type: String,
    required: [true, 'please provide your first name'],
    minLength: [2, 'a name must be atleast two characters long'],
    trim: true,
  },

  handle: {
    type: String,
    unique: [true, "This handle has already been chosen"],
    validate: {
      validator: function(value) {
        return value.length >= 2;
      },
      message: "Your handle cannot be empty"
    }
  },

  fcmToken: {
    type: String,
    select: false
  },

  /**
     * ## LAST NAME
     * @param {String} lastName This is the user's last name
     */
  lastName: {
    type: String,
    required: [true, 'please provide your last name'],
    minLength: [2, 'a name must be atleast two characters long'],
    trim: true,
  },

  /**
     * ## EMAIL
     * @param {String} email is the user's email adress
     */
  email: {
    type: String,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
    required: [true, 'please provide an email'],
    unique: [true, "This user already exists"],
  },

  /**
     * ## EMAIL VERIFIED
     * @param {Boolean} emailVerified This is a tag that shows if the user's email address has been verified or not
     */
  emailVerified: {
    type: Boolean,
    enum: {
      values: [true, false],
      message: 'email verified can only be true or false',
    },
    default: false,
  },
  /**
     * ## IS VERIFIED
     * @param {Boolean} isVerified This is a tag that shows if the user is verified or not
     */
    //! New
  isVerified: {
    type: Boolean,
    enum: {
      values: [true, false],
      message: 'is verified can only be true or false',
    },
    default: false,
  },

  /**
     * ## FOLLOWERS
     * @param {Boolean} followers This is a tag that shows the number of followers a user has
     */
    //! New
  followers: {
    type: Number,
    default: 0,
  },

  /**
     * ## FOLLOWING
     * @param {Boolean} following This is a tag that shows the number of followers a user is following
     */
    //! New
  following: {
    type: Number,
    default: 0,
  },

  /**
     * ## PROFILE PICTURE
     * @param {String} profilePicture this is the user's profile picture
     */
  profilePicture: {
    type: String,
    default: 'default.png',
  },

  //! New
  /**
     * ## PROFILE PICTURE
     * @param {String} banner this is the banner that'll be displayed in the user's profile page
     */
  banner: {
    type: String,
    default: 'default.png',
  },

  /**
     * ## PASSWORD
     * @param {String} password is the user's password
     */
  password: {
    type: String,
    required: [true, 'the password field cannot be empty'],
    select: false,
    validate: {
      validator: function (value) {
        if (this.isNew || this.isModified('password')) {
          return value.length >= 8 && value.length <= 16;
        } else {
          return true;
        }
      },
      message: 'your password should be 8 to 16 characters long}',
    },
  },

  /**
     * ## CONFIRM PASSWORD
     * @param {String} confirmPassword is the user's confirmPassword
     */
  confirmPassword: {
    type: String,
    required: [true, 'the confirm password field cannot be empty'],
    validate: {
      validator: function (el) {
        if (
          this.isNew ||
          this.isModified('confirmPassword') ||
          this.isModified('password')
        ) {
          const validated = el === this.password;
          this.confirmPassword = undefined;

          return validated;
        } else {
          return true;
        }
      },
      message: "your password and confirmPassword don't match",
    },
    select: false,
  },
  
  //* GENDER
  gender: {
    type: String,
    lowercase: true,
    enum: {
      values: ['male', 'female'],
      message: 'a user can only be male or female',
    },
  },

  //* SCHOOL
  school: {
    type: String,
  },

  //! New
  department: {
    type: String
  },

  //! New
  level: {
    type: Number
  },

  //* ROLE
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'tutor'],
      message: 'The only available roles are user and admin',
    },
    default: 'user',
  },

 //* LAST CHANGED PASSWORD
 /**
  * ## LAST CHANGED PASSWORD
  * @param {Date} lastChangedPassword This keeps track of the last time a user changed their password
  */
  lastChangedPassword: {
    type: Date,
    select: false,
  },

  //! New
  deleted: {
    type: Boolean,
    default: false,
    select: false
  },

  monthlyProfit: {
    type: Number,
    default: 0,
    select: false
  },

  //* EMAIL OTP
  /**
   * @param {String} emailOtp This is the otp used to verify the user's email
   */
  emailOtp: {
    type: String,
    select: false,
  },

  //* PASSWORD OTP
  /**
   * @param {String} passwordOtp This is the otp used to verify the password
   */
  passwordOtp: {
    type: String,
    select: false,
  },

  //* OTP EXPIRY DATE
  /**
   * @param {Date} otpExpiryDate This is the validity period before the otp is considered invalid
   */
  otpExpiryDate: {
    type: Date,
    select: false,
  },
});

userSchema.pre('save', function(next) {

  console.log('::: inside pre \'save\' hook for generating handle');

  if(this.isNew) {
    try {
      this.handle = `@${this.firstName}${this.lastName}${this._id.toString().slice(-6)}`.toLowerCase();
    } catch (error) {
      //? the user would then choose later when he's updating his profile
    }
    console.log("N E W H A N D L E IS " + this.handle);
  }

  next();
})



/**
 * This pre save hook hashes the password before saving the document to the database
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.lastChangedPassword = Date.now() - 2000;

  next();
});

/**
 * Confirms that the clientPassword is the same as the one stored in the user object.
 * @param {String} clientPassword This is the password supplied by the client
 * @param {String} dbPassword This is the password stored in the user object
 * @returns {boolean} This is the result of the comparison.
 */
userSchema.methods.checkPassword = async function (clientPassword, dbPassword) {
  return await bcrypt.compare(clientPassword, dbPassword);
};

/**
 * This schema method calculates the percentage income of the creator and adds it to their earnings
 */
userSchema.methods.addIncomePercentage = function(income) {
  if(!income) return;
  const percentageIncome = 0.55 * income;
  this.monthlyProfit += percentageIncome;
  this.monthlyProfit = this.monthlyProfit.toFixed(1);

  console.log("ADDING INCOME", percentageIncome, this.monthlyProfit);
  this.save();
}

/**
 * 
 * @param {String} type This can be "password" or "email"
 * @returns otp
 */
userSchema.methods.generateOTP = async function (type) {
  const otp = await promisify(crypto.randomInt)(100000, 999999);
  
  if(type === 'password') {
    this.passwordOtp = crypto.createHash('sha256').update(otp.toString()).digest('hex');
    
  } else if(type === "email") {
    this.emailOtp = crypto.createHash('sha256').update(otp.toString()).digest('hex');
    
  }

  this.otpExpiryDate = Date.now() + 10 * 60 * 1000;

  return otp;
};

/**
 * 
 * @param {Date} jwtIssueDate 
 * @returns boolean, representing if the password has been changed after the jwt has been issued,
 * i.e since the last time the user logged in
 */
userSchema.methods.changedPasswordAfterJwtWasIssued = function (jwtIssueDate) {
  return jwtIssueDate < this.lastChangedPassword.getTime() / 1000;
};

/**
 * This is the user model on which the various CRUD operations can be done on
 */
const userModel = mongoose.model('User', userSchema);


//? Exporting the user model
module.exports = userModel;
