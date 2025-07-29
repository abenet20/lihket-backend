const database = require("../dbControllers/db_connection.js");
const verifyToken = require("../../middleware/verifyToken.js");

exports.parentStudentsList = [
  verifyToken,
  async (req, res) => {
    try {
      //getting parent id
      const [parent] = await database.query(
        `SELECT * FROM parents WHERE user_id = ? AND is_deleted = 0`,
        [req.user.id]
      );

      //getting students related with this parent by parent id from students table
      const [students] = await database.query(
        `SELECT * FROM students WHERE parent_id = ? AND is_deleted = 0`,
        [parent.parent_id]
      );

     return res.status(200).json({
        students: students
      });
    } catch (error) {
     return res.status(500).json({
        message: "Failed to fetch from database",
        error,
      });
    }
  },
];
