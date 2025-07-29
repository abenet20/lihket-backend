const verifyToken = require("../../middleware/verifyToken.js");
const { body, validationResult } = require("express-validator");
const database = require("../dbControllers/db_connection.js");

exports.addScores = [
  body("name").isLength({ min: 1 }).withMessage("Name is required"),
  body("teacher_id")
    .isLength({ min: 1 })
    .withMessage("Teacher Id is required")
    .isNumeric()
    .withMessage("Teacher ID must be a number"),
  body("class_name").isLength({ min: 1 }).withMessage("Class is required"),
  body("student_id")
    .isLength({ min: 1 })
    .withMessage("Student Id is required")
    .isNumeric()
    .withMessage("Student ID must be a number"),
  body("subject_id")
    .isLength({ min: 1 })
    .withMessage("Subject is required")
    .isNumeric()
    .withMessage("Subject ID must be a number"),
  body("score")
    .isLength({ min: 1 })
    .withMessage("Score is required")
    .isNumeric()
    .withMessage("Score must be a number"),
  body("term").isLength({ min: 1 }).withMessage("Term is required"),
  body("markedReason")
    .isLength({ min: 1 })
    .withMessage("Marked Reason is required"),
  body("outOf")
    .isLength({ min: 1 })
    .withMessage("Out of is required")
    .isNumeric()
    .withMessage("Out of must be a number"),
  verifyToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      teacher_id,
      class_name,
      student_id,
      subject_id,
      score,
      term,
      markedReason,
      outOf,
    } = req.body;

    try {
      const [marks] = await database.query(
        `INSERT INTO marks (teacher_id,subject_id, out_of, marked_reason, class, term) VALUES (?, ?, ?, ?, ?, ?)`,
        [teacher_id, subject_id, outOf, markedReason, class_name, term]
      );

      if (marks.affectedRows === 0) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to add marks." });
      }

      // Insert new score
      await database.query(
        `INSERT INTO scores (student_id ,name, score, mark_id) VALUES (?, ?, ?, ?)`,
        [student_id, name, score, marks.insertId]
      );

      res
        .status(201)
        .json({ success: true, message: "Score added successfully." });
    } catch (error) {
      console.error("Database error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  },
];
