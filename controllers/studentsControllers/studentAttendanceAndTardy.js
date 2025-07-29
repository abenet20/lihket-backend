const database = require("../dbControllers/db_connection.js");
const verifyToken = require("../../middleware/verifyToken.js");

exports.studentAttendanceAndTardy = [
  verifyToken,
  async (req, res) => {
   try{
    //getting student id
    const [student] = await database.query(
      `SELECT student_id FROM students WHERE user_id = ?`,
      [req.user.id]
    );

    //getting students attendance
    const [attendance] = await database.query(
      ` SELECT * FROM attendance WHERE student_id = ? AND is_deleted = 0`,
      [student[0].student_id]
    );

     //getting students tardy status
    const [tardy] = await database.query(
      ` SELECT * FROM tardy WHERE student_id = ? AND is_deleted = 0`,
      [student[0].student_id]
    );

    return res.status(200).json({
        attendance: attendance,
        tardy: tardy
      });
} catch(error){
    return res.status(500).json({
        message: "Error fetching student data", error 
    })
}
  },
];

