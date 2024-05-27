const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  requestToVerify,
  verifyaccount,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
  getAllUnverifiedUser,
  deleteAllUnverifiedUser,
} = require("../controllers/userController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
//Routs
const router = express.Router();

//Multer File Handle
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/../public/uploads/user`);
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}_${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

router.post("/register", upload.single("image"), registerUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router
  .route("/account/verifirequest")
  .post(isAuthenticatedUser, requestToVerify);

router.route("/account/verify/:token").get(verifyaccount);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.put(
  "/me/update",
  isAuthenticatedUser,
  upload.single("image"),
  updateProfile
);

// router
//   .route("/admin/users")
//   .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

router.route("/admin/users").get(getAllUser);

router
  .route("/admin/users/unverified")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUnverifiedUser);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);
router
  .route("/admin/users/unverified/delete")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    deleteAllUnverifiedUser
  );

module.exports = router;
