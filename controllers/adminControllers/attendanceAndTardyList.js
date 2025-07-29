const database = require("../dbControllers/db_connection");
const verifyToken = require("../../middleware/verifyToken");

exports.attendanceList = [
  verifyToken,
  async (req, res) => {
    const [attendanceList] = await database.query(`SELECT * FROM attendance WHERE is_deleted = 0`);

    return res.json(attendanceList);
  },
];

exports.tardyList = [
  verifyToken,
  async (req, res) => {
    const [tardyList] = await database.query(`SELECT * FROM tardy WHERE is_deleted = 0`);

    return res.json(tardyList);
  },
];