const mongoose = require("mongoose");
const validator = require("validator");

const projectSchema = new mongoose.Schema({
  emailaddress: {
    type: String,
    required: [true, "Please Enter Your Email"],
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  phonenumber: {
    type: String,
    required: [true, "Please Enter Your phone number"],
    validate: [validator.isMobilePhone, "Please enter a valid phone number"],
  },
  userId: {
    type: String,
  },
  title: {
    type: String,
    required: [true, "Please Enter Project Title"],
    minLength: [4, "Title should have more than 4 characters"],
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    default: "pending", // running completed canceled
  },
  projectImage: {
    type: String,
  },
  requiredCredential: {
    sitelink: {
      type: String,
      default: "Not Required",
    },
    otherCredential: {
      type: String,
      default: "Not Required",
    },
  },
  technologies: [
    {
      type: String,
    },
  ],
  costing: {
    totalamount: {
      type: Number,
    },
    currency: {
      type: String,
    },
    paid: {
      type: Number,
    },
    additionalCharge: {
      type: Number,
    },
    remark: {
      type: String,
    },
    discount: {
      type: Number,
    },
  },
  remarks: {
    type: String,
    default: "Not Required",
  },
  milestone: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("project", projectSchema);
