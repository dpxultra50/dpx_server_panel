const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const NewsLetter = require("../models/newsLetterModel");

// Newsletter subscribe
exports.subscribe = catchAsyncErrors(async (req, res, next) => {
  const { name, email, message } = req.body;

  await NewsLetter.create({
    name,
    email,
    message,
  });

  res.status(201).json({
    success: true,
  });
});

// Get All Quote (Newsletter's Which Have Message)
exports.getAllQuote = catchAsyncErrors(async (req, res, next) => {
  const newsletters = await NewsLetter.find({
    message: { $exists: true, $ne: "" },
  }).sort({ createdAt: -1 }); // Sort by creation date in descending order

  res.status(200).json({
    success: true,
    allQuotes: newsletters,
  });
});
