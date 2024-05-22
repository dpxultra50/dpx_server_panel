const express = require("express");
const {
  userMeetingRequest,
  userMeetingSchedule,
  getAllUserMeeting,
  deleteAllUserMeeting,
  getUserMeetingDetails,
  getUserMeetingHistory,
} = require("../controllers/userMeetingController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/meeting/request").post(userMeetingRequest);

router
  .route("/meeting/history")
  .get(isAuthenticatedUser, getUserMeetingHistory);
router.route("/meeting/:id").get(getUserMeetingDetails);

router.route("/admin/meeting/schedule/:id").put(userMeetingSchedule);
router
  .route("/admin/meetings")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUserMeeting);

router
  .route("/admin/meetings/delete")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteAllUserMeeting);

module.exports = router;
