const express = require("express");
const {
  subscribe,
  getAllQuote,
} = require("../controllers/newsLetterController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
//Routs
const router = express.Router();

router.route("/newsletter/subscribe").post(subscribe);
router
  .route("/newsletter/allquotes")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllQuote);

module.exports = router;
