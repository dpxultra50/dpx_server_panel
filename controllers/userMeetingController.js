const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const UserMeeting = require("../models/userMeetingModel");
const moment = require("moment");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const ApiFeatures = require("../utils/apifeatures");
const ErrorHander = require("../utils/errorhander");

// Create New Meeting Request
exports.userMeetingRequest = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  const {
    name,
    email,
    guestEmails,
    phonenumber,
    inquiryType,
    message,
    startTime,
    timeZone,
    preferredPlatform,
  } = req.body;

  const parsedguestEmails = JSON.parse(guestEmails);
  const parsedPreferredPlatform = JSON.parse(preferredPlatform);
  const startTimeFormatted = moment(startTime, "llll").toDate();

  const userMeeting = await UserMeeting.create({
    name,
    email,
    guestEmails: parsedguestEmails,
    phonenumber,
    inquiryType,
    message,
    startTime: startTimeFormatted,
    timeZone,
    preferredPlatform: parsedPreferredPlatform,
  });

  // If logged-in user made the request, add user ID
  var user;
  if (token !== undefined) {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    user = await User.findById(decodedData.id);
    userMeeting.user = user._id;
    await userMeeting.save();
  }

  // Meeting details link
  const meetingDetailsLink = `${process.env.FRONTEND_URL}/#/meeting/details/${userMeeting._id}`;
  const platform = parsedPreferredPlatform.platformName || "N/A";
  const link = parsedPreferredPlatform.platformAddress || "N/A";
  const credential = parsedPreferredPlatform.requiredCredential || "N/A";
  const startTimeDate = moment(userMeeting.startTime).format("llll");

  // Constructing the email message
  const notificationMessage = `
    New Meeting Request from ${name}:
    
    - Inquiry Type: ${inquiryType}
    - Message: ${message}
    - Phone Number: ${phonenumber}
    - Email: ${email}
    - Start Time: ${startTimeDate}
    - Time Zone: ${timeZone}
    - Preferred Platform: ${platform}
    - Meeting Link: ${link}
    - Credential (if required): ${credential}
    
    For more details, visit: ${meetingDetailsLink}
  `;

  // List of emails to notify
  const notificationEmails = [
    "rezowan.datapollex@gmail.com",
    "rakib.datapollex@gmail.com",
    "dipto.datapollex@gmail.com",
    "datapollex@gmail.com",
  ];

  // Sending email notifications
  try {
    for (const recipientEmail of notificationEmails) {
      await sendEmail({
        email: recipientEmail,
        subject: `New Meeting Request from ${name}`,
        message: notificationMessage,
      });
    }
  } catch (error) {
    return next(new ErrorHander("Failed to send notification emails", 500));
  }

  res.status(201).json({
    success: true,
    meetingId: userMeeting._id,
    message: "Meeting request created and notifications sent successfully.",
  });
});

// Get Users Meeting Detail
exports.getUserMeetingDetails = catchAsyncErrors(async (req, res, next) => {
  const uerMeeting = await UserMeeting.findById(req.params.id);
  if (!uerMeeting) {
    return next(new ErrorHander("No User Meeting Exists In This id", 404));
  }
  res.status(200).json({
    success: true,
    uerMeeting,
  });
});

// Get User Meeting history
exports.getUserMeetingHistory = catchAsyncErrors(async (req, res, next) => {
  const meeting = await UserMeeting.find({
    user: req.user.id,
  }).select(
    "inquiryType status startTime duration preferredPlatform guestEmails message"
  );

  res.status(200).json({
    success: true,
    meeting,
  });
});

//Edit, Verify And Schedule A Meeting
exports.userMeetingSchedule = catchAsyncErrors(async (req, res, next) => {
  const startTimeFormatted = moment(req.body.startTime, "llll").toDate();
  const parsedPreferredPlatform = JSON.parse(req.body.preferredPlatform);
  // console.log(parsedPreferredPlatform);
  const newUserMeetingData = {
    startTime: startTimeFormatted,
    duration: req.body.duration,
    status: req.body.status,
    preferredPlatform: parsedPreferredPlatform,
  };

  const userMeeting = await UserMeeting.findByIdAndUpdate(
    req.params.id,
    newUserMeetingData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  if (!userMeeting) {
    return next(new ErrorHander("No Meeting Exists In This id", 404));
  }

  let emailaddresses = [userMeeting.email];

  if (userMeeting.guestEmails.length > 0) {
    emailaddresses = emailaddresses.concat(userMeeting.guestEmails);
  }

  const nonEmptyEmails = emailaddresses.filter((email) => email !== "");

  const startTimeDate = moment(userMeeting.startTime).format("llll");
  const platform = userMeeting.preferredPlatform.platformName;
  const link = userMeeting.preferredPlatform.platformAddress;
  const credential = userMeeting.preferredPlatform.requiredCredential;

  //FOR SERVER MODE
  //${req.protocol}://${req.get("host")}
  //FOR DEV MODE
  //${process.env.FRONTEND_URL}

  const meetingDetailsLink = `${process.env.FRONTEND_URL}/#/meeting/details/${userMeeting._id}`;

  const message = `Congratulations!!! \n\nWe are pleased to inform you that your meeting with DataPollex has been scheduled for ${startTimeDate}.\nThe meeting will be conducted on the ${platform} platform.\n\n\tTo join the meeting, simply click the link provided below \n ${link}.\n\n\n\tPlease make sure to save the following credentials for authentication \n\t Credential : ${credential}.\n\tFor further details regarding the meeting, kindly visit the following link: ${meetingDetailsLink}`;

  if (userMeeting.status === "scheduled") {
    let sentTo = "";
    for (let i = 0; i < nonEmptyEmails.length; i++) {
      try {
        await sendEmail({
          email: nonEmptyEmails[i],
          subject: `Join DataPollex Meeting - Important Details Inside`,
          message,
        });
      } catch (error) {
        return next(new ErrorHander(error.message, 500));
      }
      sentTo += emailaddresses[i] + ",";
    }
    res.status(200).json({
      success: true,
      message: `Email sent to ${sentTo} successfully`,
    });
  } else {
    res.status(200).json({
      success: true,
      message: `Meeting Details is updated`,
    });
  }
});

// Get all or filtered users meetings(admin)
exports.getAllUserMeeting = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 9;
  const meetingsCount = await UserMeeting.countDocuments();

  const apiFeature = new ApiFeatures(
    UserMeeting.find().sort({ createdAt: -1 }),
    req.query
  ).statusFilter();
  let userMeetings = await apiFeature.query;

  let filteredMeetingsCount = userMeetings.length;

  apiFeature.pagination(resultPerPage);

  userMeetings = await apiFeature.query.clone();

  res.status(200).json({
    success: true,
    userMeetings,
    meetingsCount,
    resultPerPage,
    filteredMeetingsCount,
  });
});

// Delete all or filtered  users meetings(admin)
exports.deleteAllUserMeeting = catchAsyncErrors(async (req, res, next) => {
  const meetingsCount = await UserMeeting.countDocuments();

  const apiFeature = new ApiFeatures(
    UserMeeting.find(),
    req.query
  ).statusFilter();

  let userMeetings = await apiFeature.query.deleteMany();

  const thenMeetingsCount = await UserMeeting.countDocuments();

  res.status(200).json({
    success: true,
    message: ` ${meetingsCount - thenMeetingsCount} ${
      req.query.keyword ? req.query.keyword : ""
    } User Meetings Has Been Deleted Successfully`.toUpperCase(),
  });
});
