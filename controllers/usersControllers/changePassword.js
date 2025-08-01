const database = require("../dbControllers/db_connection");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const verifyToken = require("../../middleware/verifyToken");
const { send } = require("../senders/smsSender");

exports.changePassword = [
  verifyToken,
  body("oldPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
      const [user] = await database.query(
        `SELECT * FROM users WHERE user_id = ?`,
        [userId]
      );

      const is_match = await bcrypt.compare(oldPassword, user[0].password);
      if (!is_match) {
        return res.status(400).json({
          success: false,
          message: "Old password is incorrect",
        });
      }

      if (oldPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password cannot be the same as old password",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await database.query(`UPDATE users SET password = ? WHERE user_id = ?`, [
        hashedPassword,
        userId,
      ]);

      send(user[0].phone, "Your password has been reset successfully.");
      return res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];
