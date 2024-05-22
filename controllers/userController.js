const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const fs = require("fs");

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  let userImage;
  if (req.file) {
    userImage = req.file.filename;
  }

  const { name, email, phonenumber, password, companyname, companyrole } =
    req.body;

  const user = await User.create({
    name,
    email,
    phonenumber,
    password,
    companyname,
    companyrole,
    userImage,
  });

  sendToken(user, 201, res);
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHander("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "logged out successfully",
  });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHander("User not found", 404));
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/#/password/reset/${resetToken}`;

  //For Dev Mode
  // const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `We have received a request to reset the password for your DataPollex account.\n\n Click the link below to reset your password \n\n ${resetPasswordUrl} \n\n\n If this was a mistake, just ignore this email and nothing will happen.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Reset Your Password`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHander(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

//Request To Verify Aaccount
exports.requestToVerify = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHander("User not found", 404));
  }

  if (user.verified == true) {
    return next(
      new ErrorHander("Your account has already been verified.", 201)
    );
  }
  // Get Token To verify Aaccount
  const verifyToken = user.getVerifyAaccountToken();

  await user.save({ validateBeforeSave: false });

  //Server Mode
  const verifyAaccountUrl = `${process.env.FRONTEND_URL}/#/account/verify/${verifyToken}`;

  //Dev mode
  // const verifyAaccountUrl = `${process.env.FRONTEND_URL}/account/verify/${verifyToken}`;

  const message = `We have received a request to verify your DataPollex account. \n\n Click the link below to verify your aaccount: \n\n ${verifyAaccountUrl} \n\nIf this was a mistake, just ignore this email and nothing will happen.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Verify Your Aaccount`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.verifyAaccountToken = undefined;
    user.verifyAaccountExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }
});

//Verifying Account
exports.verifyaccount = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const verifyAaccountToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    verifyAaccountToken,
    verifyAaccountExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHander("Invalid link", 400));
  }

  user.verified = true;
  user.verifyAaccountToken = undefined;
  user.verifyAaccountExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "email verified sucessfully",
  });
});

// Get User Detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHander("No User Exists In This id", 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    phonenumber: req.body.phonenumber,
    companyname: req.body.companyname,
    companyrole: req.body.companyrole,
  };

  const user = await User.findById(req.user.id);

  if (req.file) {
    // Delete current profile image if it exists
    if (user.userImage) {
      fs.unlink(
        `${__dirname}/../public/uploads/user/${user.userImage}`,
        (err) => {
          if (err) return next(new ErrorHander(err, 400));
          console.log("Current profile image deleted");
        }
      );
    }

    const userImage = req.file.filename;
    newUserData.userImage = userImage;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Get all users(admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  const verifiedUsers = await User.find({ verified: true });
  const unVerifiedUsers = await User.find({ verified: false });

  const users = verifiedUsers.concat(unVerifiedUsers);
  res.status(200).json({
    success: true,
    users,
  });
});

// Get all unverified users(admin)
exports.getAllUnverifiedUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ verified: false });

  res.status(200).json({
    success: true,
    users,
  });
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHander(`No Meeting Occurred Yeat: ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    success: true,
  });
});

// Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }
  //HELLOoOoOoOoOoO---User Image delete Handeled Yeat

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});

// Delete All Unverified User --Admin
exports.deleteAllUnverifiedUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.deleteMany({ verified: false });
  //HELLOoOoOoOoOoO---User Image delete Handeled Yeat

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
