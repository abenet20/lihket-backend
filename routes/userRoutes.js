const express = require("express");
const router = express.Router();
const { login } = require("../controllers/usersControllers/login");
const {
  forgetPassword,
  ValidateOtp,
  resetPassword
} = require("../controllers/usersControllers/forgetPassword");

router.post("/login", login);
router.get("/forget-password", forgetPassword);
router.post("/validate-otp", ValidateOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
