const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Project = require("../models/projectModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const fs = require("fs");

// Create A Project --Admin
exports.createProject = catchAsyncErrors(async (req, res, next) => {
  let projectImage;

  if (req.file) {
    projectImage = req.file.filename;
  }

  const {
    emailaddress,
    phonenumber,
    userId,
    title,
    description,
    requiredCredential,
    technologies,
    costing,
    remarks,
    milestone,
  } = req.body;

  const parsedrequiredCredential = JSON.parse(requiredCredential);
  const parsedtechnologies = JSON.parse(technologies);
  const parsedcosting = JSON.parse(costing);

  const createProject = await Project.create({
    emailaddress,
    phonenumber,
    userId,
    title,
    description,
    requiredCredential: parsedrequiredCredential,
    technologies: parsedtechnologies,
    costing: parsedcosting,
    remarks,
    milestone,
    projectImage,
  });

  res.status(201).json({
    success: true,
    message: "Project Created Successfully",
    projectId: createProject._id,
  });
});

// update Project --Admin
exports.updateProject = catchAsyncErrors(async (req, res, next) => {
  const parsedrequiredCredential = JSON.parse(req.body.requiredCredential);
  const parsedtechnologies = JSON.parse(req.body.technologies);
  const parsedcosting = JSON.parse(req.body.costing);

  const newProjectData = {
    email: req.body.email,
    phonenumber: req.body.phonenumber,
    userId: req.body.userId,
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    requiredCredential: parsedrequiredCredential,
    technologies: parsedtechnologies,
    costing: parsedcosting,
    remarks: req.body.remarks,
    milestone: req.body.milestone,
  };

  const project = await Project.findById(req.params.id);

  if (req.file) {
    // Delete current profile image if it exists
    if (project.projectImage) {
      fs.unlink(
        `${__dirname}/../public/uploads/project/${project.projectImage}`,
        (err) => {
          if (err) return next(new ErrorHander(err, 400));
        }
      );
    }

    const projectImage = req.file.filename;
    newProjectData.projectImage = projectImage;
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    newProjectData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    projectId: updatedProject._id,
  });
});

// Get all Project(admin)
exports.getAllProject = catchAsyncErrors(async (req, res, next) => {
  const projects = await Project.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    projects,
  });
});

// Get all Project to Dispaly (user)
exports.displayProject = catchAsyncErrors(async (req, res, next) => {
  const projects = await Project.find({ status: "completed" })
    .sort({
      createdAt: -1,
    })
    .select("_id requiredCredential.sitelink title projectImage technologies");

  res.status(200).json({
    success: true,
    projects,
  });
});

// Get Project Detail (User And Admin)
exports.getProjectDetails = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  var user;

  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(new ErrorHander("No Project Exists In This id", 404));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  user = await User.findById(decodedData.id);

  if (user.role === "admin") {
    res.status(200).json({
      success: true,
      project,
    });
  }

  if (user.role === "user") {
    if (project.userId === user._id.toString()) {
      res.status(200).json({
        success: true,
        project,
      });
    } else {
      return next(new ErrorHander("Nan of your project found on this ID", 404));
    }
  }
});

// Get User Project history
exports.getUserProjectsHistory = catchAsyncErrors(async (req, res, next) => {
  const projects = await Project.find({
    userId: req.user.id,
  });

  res.status(200).json({
    success: true,
    projects,
  });
});
