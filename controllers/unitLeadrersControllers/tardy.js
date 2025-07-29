const database = require("../dbControllers/db_connection.js");
const { body, validationResult } = require("express-validator");
const verifyToken = require("../../middleware/verifyToken.js");
const { toEthiopian } = require("ethiopian-date");
const { send } = require("../senders/smsSender.js");

exports.tardy = [
  verifyToken,
  body("students")
    .isArray()
    .withMessage("Students must be an array")
    .isLength({ min: 1 })
    .withMessage("it should contain atleast one student"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const today = new Date();
    const [year, month, day] = toEthiopian(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );
    const ethDate = `${year}-${month}-${day}`; //ethiopian date format

    const { students } = req.body;
    let savedStudents = [];
    let notSavedStudents = [];

    try {
      for (const student of students) {
        const { student_id, name, status } = student;
        //to get student`s extra data from parents and students tables
        const [studentData] = await database.query(
          "SELECT * FROM students WHERE student_id = ? AND is_deleted = 0",
          [student_id]
        );

        const [parent] = await database.query(
          "SELECT * FROM parents WHERE parent_id = ? AND is_deleted = 0",
          [studentData[0].parent_id]
        );

        // Check if the record exists
        const [tardy] = await database.query(
          "SELECT * FROM tardy WHERE student_id = ? AND date = ?",
          [student_id, ethDate]
        );

        if (tardy.length > 0) {
          notSavedStudents.push({
            student_id: student_id,
            name: name,
            date: ethDate,
            status: status,
            message: "Tardy already recorded for this student on this date.",
          });
        } else {
          const [insertTardy] = await database.query(
            "INSERT INTO tardy (student_id, name, date, status) VALUES (?, ?, ?, ?)",
            [student_id, name, ethDate, status]
          );

          if (status === "late") {
            send(
              parent[0].phone,
              `Dear Ato/Wro. ${parent[0].name} Your Child ${name} has been marked as late on ${ethDate}.`
            );
            send(
              studentData[0].phone,
              `Dear ${name} you have been marked as late on ${ethDate}.`
            );
          }

          savedStudents.push({
            student_id: student_id,
            name: name,
            date: ethDate,
            status: status,
            message: "Tardy recorded successfully.",
          });
        }
      }
      res.status(200).json({
        success: true,
        message: "Tardy recorded successfully",
        savedStudents,
        notSavedStudents,
      });
    } catch (error) {
      console.error("Error during tardy recording:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];
