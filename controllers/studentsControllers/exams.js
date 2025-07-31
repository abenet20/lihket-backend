const verifyToken = require("../../middleware/verifyToken.js");
const { body, validationResult } = require("express-validator");
const database = require("../dbControllers/db_connection.js");

exports.getExams = [
  verifyToken,
   async (req, res) => {
    try {
      const userId = req.user.id;

     //fetching student details
     const [student] = await database.query(
        "SELECT * FROM students WHERE user_id = ? AND is_deleted = 0",
        [userId]
        );

      // Fetching exams for the teacher
      const [exams] = await database.query(
        `SELECT exam_schedules.*, subjects.name AS subjectName, classes.name AS className 
         FROM exam_schedules
         JOIN subjects ON exam_schedules.subject_id = subjects.id 
         JOIN classes ON exam_schedules.class_id = classes.class_id 
         WHERE exam_schedules.class_id = ? AND exam_schedules.is_deleted = 0`,
        [student[0].class_id]
      );

      return res.status(200).json({ success: true, exams });
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ error: "Internal server error" });
    }
}
];