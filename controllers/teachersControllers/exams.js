const verifyToken = require("../../middleware/verifyToken.js");
const { body, validationResult } = require("express-validator");
const database = require("../dbControllers/db_connection.js");

exports.addExam = [
  verifyToken,

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be in valid ISO8601 format (e.g. YYYY-MM-DD)"),

  body("classes")
    .isArray()
    .withMessage("Classes must be an array")
    .notEmpty()
    .withMessage("Class is required")
    .isLength({ min: 1 })
    .withMessage("the exam should atleast be for one class"),

    body("details")
    .optional()
    .isString()
    .withMessage("Details must be a string")
    .isLength({ max: 500 })
    .withMessage("Details must not exceed 500 characters"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extracting subject, teacher, date, and classes from the request body
    const userId = req.user.id; // Assuming user ID is stored in req.user.id
    console.log("User ID:", req.user);
    const [teacher] = await database.query(
      "SELECT * FROM teachers WHERE user_id = ? AND is_deleted = 0",
      [userId]
    );


    if (!teacher.length) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    const teacherId = teacher[0].teacher_id;
    const subjectId = teacher[0].subject_id;

    const [subject] = await database.query(
      "SELECT * FROM subjects WHERE id = ? AND is_deleted = 0",
      [subjectId]
    );


    const { date, classes, details } = req.body;
    let existinClasses = [];
    let savedClasses = [];

    for (const classId of classes) {
      // Check if the class exists in the database
      const [classExists] = await database.query(
        "SELECT * FROM exam_schedules WHERE class_id = ? AND date = ? AND subject_id = ? AND is_deleted = 0",
        [classId, date, subjectId]
      );
      if (!classExists.length) {
        const [exam] = await database.query(
          "INSERT INTO exam_schedules (subject_id, teacher_id, details, class_id, date) VALUES (?, ?, ?, ?, ?)",
          [subjectId, teacherId, details, classId, date]
        );
        savedClasses.push(classId);
      } else {
        existinClasses.push(classId);
      }
      res.status(201).json({
        success: true,
        message: "Exam added successfully",
        savedClasses: savedClasses,
        existingClasses: existinClasses,
      });
    }
  },
];

exports.getExams = [
  verifyToken,
    async (req, res) => {
        const userId = req.user.id; // Assuming user ID is stored in req.user.id
        try {
            const [teacher] = await database.query(
                "SELECT * FROM teachers WHERE user_id = ? AND is_deleted = 0",
                [userId]
            );
        const [exams] = await database.query(
            "SELECT * FROM exams WHERE teacher_id =? AND is_deleted = 0"
        );
        if (!exams.length) {
            return res.status(404).json({ error: "No exams found" });
        }
        res.status(200).json({ success: true, exams });
        } catch (error) {
        console.error("Error fetching exams:", error);
        res.status(500).json({ error: "Internal server error" });
        }
    },
];