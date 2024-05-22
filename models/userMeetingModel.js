const mongoose = require("mongoose");
const validator = require("validator");

const UserMeetingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: false,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  guestEmails: [
    {
      type: String,
      validate: [validator.isEmail, "Please Enter a valid Email"],
    },
  ],
  phonenumber: {
    type: String,
    required: [true, "Please Enter Your Email"],
    validate: [validator.isMobilePhone, "Please enter a valid phone number"],
  },
  inquiryType: {
    type: String,
    required: [true, "Please Enter Type of Inquiry"],
  },
  message: {
    type: String,
    required: [true, "Please Give Us a Short Note About Your Inquiry"],
  },
  startTime: {
    type: Date,
    required: [true, "Please Select Date & Time"],
  },
  timeZone: {
    type: String,
  },
  duration: {
    type: Number,
    default: 30,
  },
  preferredPlatform: {
    platformName: {
      type: String,
      required: [true, "Please select a preferred platform"],
    },
    platformAddress: {
      type: String,
      default: "Not Required",
    },
    requiredCredential: {
      type: String,
      default: "Not Required",
    },
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    default: "pending", // scheduled completed canceled
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("UserMeeting", UserMeetingSchema);
