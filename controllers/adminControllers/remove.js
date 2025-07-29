const database = require("../dbControllers/db_connection.js");
const { body, validationResult } = require("express-validator");
const verifyToken = require("../../middleware/verifyToken.js");

exports.removeStudent = [
  body("user_id")
    .isLength({ min: 1 })
    .withMessage("User ID is required")
    .isNumeric()
    .withMessage("User ID must be a number"),
  verifyToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Extracting user_id from request body
    const { user_id } = req.body;

    try {
      // Fetch student
      const [studentRows] = await database.query(
        `SELECT * FROM students WHERE user_id = ? AND is_deleted = 0`,
        [user_id]
      );
      const student = studentRows[0];

      if (!student) {
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
      }

      // Fetch parent
      const [parentRows] = await database.query(
        `SELECT * FROM parents WHERE parent_id = ? AND is_deleted = 0`,
        [student.parent_id]
      );
      const parent = parentRows[0];

      // Fetch sibling students
      const [siblingStudents] = await database.query(
        `SELECT * FROM students WHERE parent_id = ? AND user_id != ? AND is_deleted = 0`,
        [student.parent_id, user_id]
      );

      // Soft delete student from students table
      await database.query(
        `UPDATE students SET is_deleted = 1 WHERE user_id = ?`,
        [user_id]
      );

      // Soft delete user account (role: student)
      await database.query(
        `UPDATE users SET is_deleted = 1 WHERE user_id = ? AND role = 'student'`,
        [user_id]
      );

      // If no siblings, delete parent and parent user
      if (siblingStudents.length <= 0 && parent) {
        await database.query(
          `UPDATE parents SET is_deleted = 1 WHERE parent_id = ?`,
          [student.parent_id]
        );

        await database.query(
          `UPDATE users SET is_deleted = 1 WHERE user_id = ?`,
          [parent.user_id]
        );
      }

      return res.status(200).json({
        success: true,
        message: "Student removed successfully",
      });
    } catch (error) {
      console.error("Error removing student:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
];


exports.removeTeacher = [
  verifyToken,
  body("user_id")
  .isLength({ min: 1 })
    .withMessage("User ID is required")
    .isNumeric()
    .withMessage("User ID must be a number"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Extracting user_id from request body
    const { user_id } = req.body;

    try {
      // Fetch teacher
      const [teacherRows] = await database.query(
        `SELECT * FROM teachers WHERE user_id = ? AND is_deleted = 0`,
        [user_id]
      );
      const teacher = teacherRows[0];

      if (!teacher) {
        return res
          .status(404)
          .json({ success: false, message: "Teacher not found" });
      }

      // Soft delete teacher from teachers table
      await database.query(
        `UPDATE teachers SET is_deleted = 1 WHERE user_id = ?`,
        [user_id]
      );

      // Soft delete user account (role: teacher)
      await database.query(
        `UPDATE users SET is_deleted = 1 WHERE user_id = ? AND role = 'teacher'`,
        [user_id]
      );

      return res.status(200).json({
        success: true,
        message: "Teacher removed successfully",
      });
    } catch (error) {
      console.error("Error removing teacher:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }

  }
    
]