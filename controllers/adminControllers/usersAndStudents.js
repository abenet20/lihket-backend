const database = require("../dbControllers/db_connection.js");
const verifyToken = require("../../middleware/verifyToken.js");

exports.students = [
  verifyToken,
  async (req, res) => {
    const [students] = await database.query(
      `SELECT students.student_id AS id,
      students.name AS name,
      students.age AS age,
      students.gender AS gender,
      students.phone AS phone,
      students.grade AS grade,
      classes.name AS className,
      students.enrollment_date AS enrollmentDate,
      users.email as email,
      parents.parent_id AS parent_id,
      parents.name AS parentName,
      parents.phone AS parentPhone
      
   FROM students
   JOIN users ON users.user_id = students.user_id
   LEFT
   JOIN parents ON parents.parent_id = students.parent_id
   LEFT
   JOIN classes ON classes.class_id = students.class_id
   WHERE students.is_deleted = 0`
    );

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found." });
    }

    return res.status(201).json({
      success: true,
      students: students,
    });
  },
];

exports.users = [
  verifyToken,
  async (req, res) => {
    const [users] = await database.query(
      `SELECT user_id, name, username, role from users WHERE is_deleted = 0`
    );

    res.json(users);
  },
];
