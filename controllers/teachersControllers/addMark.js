const verifyToken = require("../../middleware/verifyToken.js");
const { body, validationResult } = require("express-validator");
const database = require("../dbControllers/db_connection.js");

exports.addMarkDetails = [
  body("className").isLength({ min: 1 }).withMessage("Class is required"),
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

    const userId = req.user.id;
    const { className, term, markedReason, outOf } = req.body;

    const termsInfo = {
      firstQuarter: 40,
      secondQuarter: 60,
      thirdQuarter: 40,
      fourthQuarter: 60,
    };

    try {
      const [teacher] = await database.query(
        `SELECT * FROM teachers WHERE user_id = ?`,
        [userId]
      );

     const [[{ totalMarks }]] = await database.query(
  `SELECT SUM(out_of) AS totalMarks FROM marks WHERE term = ?`,
  [term]
);

if (totalMarks >= termsInfo[term]) {
  return res.status(500).json({
    success: false,
    message:
      "You have already reached this term's mark sum. So you can't add more on this term.",
  });
}


      const [marks] = await database.query(
        `INSERT INTO marks (teacher_id,subject_id, out_of, marked_reason, class, term) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          teacher[0].teacher_id,
          teacher[0].subject_id,
          outOf,
          markedReason,
          className,
          term,
        ]
      );

      if (marks.affectedRows === 0) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to add marks." });
      }

      res
        .status(201)
        .json({ success: true, message: "Mark added successfully." });
    } catch (error) {
      console.error("Database error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  },
];
