const verifyToken = require("../../middleware/verifyToken");
const database = require("../dbControllers/db_connection");
const { toEthiopian } = require("ethiopian-date");

exports.adminDashboard = [
  verifyToken,
  async (req, res) => {
    try {
      const today = new Date();
      const [year, month, day] = toEthiopian(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate()
      );
      const ethDate = `${year}-${month}-${day}`; //ethiopian date format

      const [results] = await database.query(`
  SELECT 
    (SELECT COUNT(*) FROM students WHERE is_deleted = 0) AS totalStudents,
    (SELECT COUNT(*) FROM parents WHERE is_deleted = 0) AS totalParents,
    (SELECT COUNT(*) FROM classes WHERE is_deleted = 0) AS activeClasses,
    (SELECT COUNT(*) FROM users WHERE role != 'student' AND role != 'parent' AND is_deleted = 0) AS totalStaff,
    (SELECT COUNT(*) FROM attendance WHERE date = ${ethDate} AND status = 'present' AND is_deleted = 0) AS todayTotalAttendance
`);

//to calculate attendance oercentage
      const todayAttendance =
        results[0].totalStudents > 0
          ? (results[0].todayTotalAttendance / results[0].totalStudents) * 100
          : 0;
results[0].todayAttendance = todayAttendance;

//to append grades data
 const [gradesResult] = await database.query(`
  SELECT
      SUM(CASE WHEN grade = 1 THEN 1 ELSE 0 END) AS \`Grade 1\`,
      SUM(CASE WHEN grade = 2 THEN 1 ELSE 0 END) AS \`Grade 2\`,
      SUM(CASE WHEN grade = 3 THEN 1 ELSE 0 END) AS \`Grade 3\`,
      SUM(CASE WHEN grade = 4 THEN 1 ELSE 0 END) AS \`Grade 4\`,
      SUM(CASE WHEN grade = 5 THEN 1 ELSE 0 END) AS \`Grade 5\`,
      SUM(CASE WHEN grade = 6 THEN 1 ELSE 0 END) AS \`Grade 6\`,
      SUM(CASE WHEN grade = 7 THEN 1 ELSE 0 END) AS \`Grade 7\`,
      SUM(CASE WHEN grade = 8 THEN 1 ELSE 0 END) AS \`Grade 8\`,
      SUM(CASE WHEN grade = 9 THEN 1 ELSE 0 END) AS \`Grade 9\`,
      SUM(CASE WHEN grade = 10 THEN 1 ELSE 0 END) AS \`Grade 10\`,
      SUM(CASE WHEN grade = 11 THEN 1 ELSE 0 END) AS \`Grade 11\`,
      SUM(CASE WHEN grade = 12 THEN 1 ELSE 0 END) AS \`Grade 12\`
  FROM students
  WHERE is_deleted = 0
`);


      let stats = {};
      stats.general = results[0];
      stats.enrollmentData = gradesResult[0];
      res.json(stats);
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
        error
      });
    }
  },
];
