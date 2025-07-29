const database = require("../dbControllers/db_connection");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const {sendOtp} = require("./sendOtp");
const verifyToken = require("../../middleware/verifyToken");
const {otpValidator} = require("./otpValidator");
const jwt = require("jsonwebtoken");
const { send } = require("../senders/smsSender");
const jwt_secret = "0949102287";

exports.forgetPassword = [
  async (req, res) => {
    const { username } = req.query;
    try {
      //checking if username exists in the database
      const [checkUser] = await database.query(
        `SELECT * FROM users WHERE username = ?`,
        [username]
      );

      if (checkUser.length == 0) {
        return res.status(500).json({
          success: false,
          message: "username not found",
        });
      }

      const roleReferenceList = {
        parent: "parents",
        student: "students",
        teacher: "teachers",
      };

      const [userData] = await database.query(
        `SELECT * FROM ${
          roleReferenceList[checkUser[0]["role"]]
        } WHERE user_id = ?`,
        [checkUser[0]["user_id"]]
      );

      sendOtp(userData[0]["phone"]);
      const token = jwt.sign(userData[0], jwt_secret, {expiresIn: '5m'});

      return res.status(200).json({
        success: true,
        token: token,
        message: "otp sent"
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

exports.ValidateOtp = [
  verifyToken,
  body("otp").notEmpty().withMessage("OTP is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log(req.user);
    const { otp } = req.body;
    const phone = req.user.phone;
    const userId = req.user.user_id;

    try {
      const otpValidationResult = await otpValidator(phone, otp);
      if (!otpValidationResult.success) {
        return res.status(400).json({
          success: false,
          message: otpValidationResult.message,
        });
      }

      const token = jwt.sign({userId, phone}, jwt_secret, {expiresIn: '5m'});
      return res.status(200).json({
        success: true,
        token: token,
        message: "OTP validated successfully",
      });
    } catch (error) {
      console.error("Error validating OTP:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

exports.resetPassword = [
  verifyToken,
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newPassword } = req.body;
    const userId = req.user.user_id;

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await database.query(
        `UPDATE users SET password = ? WHERE user_id = ?`,
        [hashedPassword, userId]
      );

      send(req.user.phone, "Your password has been reset successfully.");
      return res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
];