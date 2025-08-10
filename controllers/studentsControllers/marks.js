const database = require("../dbControllers/db_connection.js");
const verifyToken = require("../../middleware/verifyToken.js");

exports.marksList = [
  verifyToken,
  async (req, res) => {
    const userId = req.user.id;

    try {
      const [student] = await database.query(
        `SELECT * FROM students WHERE user_id = ?`,
        [userId]
      );
      if (student.length === 0) {
        return res.status(404).json({
          success: false,
          message: "no student found",
        });
      }

      const [className] = await database.query(
        `SELECT class_id FROM classes WHERE class_id = ?`,
        [student[0].class_id]
      );

      if (className.length === 0) {
        return res.status(404).json({
          success: false,
          message: "no class found",
        });
      }

      const [marks] = await database.query(
        `SELECT * FROM marks WHERE class = ?`,
        [className[0].name]
      );

      if (marks.length === 0) {
        return res.status(404).json({
          success: false,
          message: "no marks found",
        });
      }

      for (const mark of marks) {
        const [score] = await database.query(
          `SELECT score FROM scores WHERE mark_id = ?`,
          [mark.id]
        );
        mark.score = score[0].score;
      }

      return res.status(200).json({ success: true, marks });
    } catch (error) {
      console.error("Database error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  },
];
