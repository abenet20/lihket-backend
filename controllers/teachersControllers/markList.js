const database = require("../dbControllers/db_connection.js");
const { body, validationResult } = require("express-validator");
const verifyToken = require("../../middleware/verifyToken");

exports.getMarkList = [
  verifyToken,
  async (req, res) => {
    const userId = req.user.id;
    try {
      const [teacher] = await database.query(
        `SELECT * FROM teachers WHERE user_id = ?`,
        [userId]
      );

      if (teacher.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Teacher not found." });
      }

      const [marks] = await database.query(
        `SELECT * FROM marks WHERE teacher_id = ?`,
        [teacher[0].teacher_id]
      );

      if (marks.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No marks found." });
      }

      for(const mark of marks) {
        const [studentsScores] = await database.query(
          `SELECT * FROM scores WHERE mark_id = ?`,
          [mark.id]
        );
        mark.studentsScores = studentsScores;

        const className = mark.class;
        const [classId] = await database.query(
          `SELECT class_id FROM classes WHERE name = ?`,
          [className]
        );

        const [students] = await database.query(
          `SELECT * FROM students WHERE class_id = ?`,
            [classId[0].class_id]
        );
        mark.students = students;
      }

     res.status(200).json({ success: true, marks});
    } catch (error) {
      console.error("Database error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  },
];
