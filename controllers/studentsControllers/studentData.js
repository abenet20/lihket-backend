const database = require("../dbControllers/db_connection.js");
const verifyToken = require("../../middleware/verifyToken.js");

exports.studentData = [
  verifyToken,
  async (req, res) => {
   
    try {
      // Fetching student data
      const [studentData] = await database.query(
        `SELECT users.user_id, 
            users.name, students.grade, students.class, students.phone, students.student_id,
            parents.name AS parentName, parents.phone AS parentPhone
            FROM users
            JOIN students ON users.user_id = students.user_id
            JOIN parents ON parents.parent_id = students.parent_id
            WHERE users.user_id = ?  AND is_deleted = 0`,
        [req.user.id]
      );

      const [studentResult] = await database.query(
        `SELECT results.student_id, results.subject_id, results.score, 
        results.term, results.year, subjects.name AS subjectName, subjects.code AS subjectCode
     FROM results 
     JOIN subjects ON results.subject_id = subjects.id
     WHERE results.student_id = ?  AND is_deleted = 0`,
        [studentData[0].student_id] // Use the first row's student_id
      );

      return res.status(200).json({
        // token: decoded,
        studentData: studentData,
        results: studentResult,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error fetching student data", error });
    }
  },
];
