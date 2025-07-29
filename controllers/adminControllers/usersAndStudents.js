const database = require("../dbControllers/db_connection.js");
const verifyToken = require("../../middleware/verifyToken.js");


exports.students = [verifyToken,
    async(req, res) => {
    const [students] = await database.query(
      `SELECT  users.user_id AS user_user_id,
      users.name AS user_name,
      users.username AS user_username,
      users.role AS user_role,
      students.student_id AS student_student_id,
      students.name AS student_name,
      students.age AS student_age,
      students.gender AS student_gender,
      students.phone AS student_phone,
      students.grade AS student_grade,
      students.section AS student_section,
      parents.parent_id AS parent_parent_id,
      parents.name AS parent_name,
      parents.phone AS parent_phone
   FROM users
   JOIN students ON students.user_id = users.user_id
   JOIN parents ON parents.student_id = students.student_id
   WHERE users.role = ? AND is_deleted = 0`,
      ["student"]
    );
    
    res.json(students);
    }
];

exports.users = [verifyToken,
    async(req, res) => {
    const [users] = await database.query(
      `SELECT user_id, name, username, role from users WHERE is_deleted = 0`
    );
    
    res.json(users);
    }
];