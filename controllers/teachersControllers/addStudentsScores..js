const verifyToken = require("../../middleware/verifyToken.js");
const { body, validationResult } = require("express-validator");
const database = require("../dbControllers/db_connection.js");

exports.addStudentsScores = [
  body("markId")
    .isLength({ min: 1 })
    .withMessage("Mark ID is required")
    .isNumeric()
    .withMessage("Mark ID must be a number")
    .trim()
    .notEmpty()
    .withMessage("Mark ID should not be empty")
    .escape()
    .isInt()
    .withMessage("Mark ID must be an integer")
    .toInt()
    .custom(async (value) => {
      const [mark] = await database.query(`SELECT * FROM marks WHERE id = ?`, [
        value,
      ]);
      if (mark.length === 0) {
        throw new Error("Mark ID does not exist");
      }
      return true;
    }),
  body("students")
    .isArray()
    .withMessage("Students must be an array")
    .custom((value) => {
      if (value.length === 0) {
        throw new Error("Students array cannot be empty");
      }
      return true;
    }),
  verifyToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { markId, students } = req.body;
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

      const [markTeacherCheck] = await database.query(
        `SELECT 8 FROM marks WHERE id = ? AND teacher_id = ?`,
        [markId, teacher[0].teacher_id]
      );
      if (markTeacherCheck.length === 0) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to add scores for this mark.",
        });
      }

      let savedScores = [];
      let updatedScores = [];

      for (const student of students) {
        const { studentId, name, score } = student;

        const [checkingScore] = await database.query(
          `SELECT * FROM scores WHERE student_id = ? AND mark_id = ?`,
          [studentId, markId]
        );

        if (checkingScore.length > 0) {
          await database.query(
            `UPDATE scores SET score = ? WHERE student_id = ? AND mark_id = ?`,
            [score, studentId, markId]
          );
          updatedScores.push({ studentId, name, score });
          continue;
        }

        if (!studentId || !name || score === undefined) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid student data." });
        }

        // Insert new score
        await database.query(
          `INSERT INTO scores (student_id, name, score, mark_id) VALUES (?, ?, ?, ?)`,
          [studentId, name, score, markId]
        );
        savedScores.push({ studentId, name, score });
      }

      res
        .status(201)
        .json({ success: true, message: "Scores added successfully.", savedScores, updatedScores });
    } catch (error) {
      console.error("Error adding scores:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to add scores." });
    }
  },
];
