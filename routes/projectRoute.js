const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const {
  createProject,
  updateProject,
  getAllProject,
  displayProject,
  getProjectDetails,
  getUserProjectsHistory,
} = require("../controllers/projectControllers");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

//Routs
const router = express.Router();

//Multer File Handle
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/../public/uploads/project`);
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}_${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/admin/project/create",
  upload.single("image"),
  isAuthenticatedUser,
  authorizeRoles("admin"),
  createProject
);

router.put(
  "/admin/project/update/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  upload.single("image"),
  updateProject
);

// router
//   .route("/admin/projects")
//   .get(isAuthenticatedUser, authorizeRoles("admin"), getAllProject);

router.route("/admin/projects").get(getAllProject);

router.route("/display/projects").get(displayProject);

router.route("/project/:id").get(getProjectDetails);
router
  .route("/projects/history")
  .get(isAuthenticatedUser, getUserProjectsHistory);

module.exports = router;
