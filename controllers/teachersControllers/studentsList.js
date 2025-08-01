const verifyToken = require("../../middleware/verifyToken.js");
const { body, validationResult } = require("express-validator");
const database = require("../dbControllers/db_connection.js");

exports.attendanceStudentsList = [
  verifyToken,
  async (req, res) => {
    const userId = req.user.id;
    try {
      const [teacher] = await database.query(
        `SELECT * FROM teachers WHERE user_id = ?`,
        [userId]
      );

      const [classroom] = await database.query(
        `SELECT * FROM classes WHERE teacher_id = ?`,
        [teacher[0].id]
      );
      // Fetching students list
      const [studentsList] = await database.query(
        `SELECT * FROM students WHERE class_id = ?`,
        [classroom[0].id]
      );
      if (studentsList.length === 0) {
        return res
          .status(404)
          .json({ message: "No students found in this class." });
      }
      res.status(200).json({
        message: "Students list fetched successfully.",
        students: studentsList,
      });
    } catch (error) {
      console.error("Error fetching students list:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
];
