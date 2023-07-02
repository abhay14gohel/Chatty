const {
  registerUser,
  authUser,
  sendEmail,
  allUsers,
} = require("../controlers/userControler");
const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
// api/user
router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login", authUser);
router.post("/sendmail", sendEmail);

module.exports = router;
