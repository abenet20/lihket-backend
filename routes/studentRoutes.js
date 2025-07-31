const express = require("express");
const router = express.Router();
const { studentData } = require("../controllers/studentsControllers/studentData");
const { studentAttendanceAndTardy  } = require("../controllers/studentsControllers/studentAttendanceAndTardy");
const { getExams } = require("../controllers/studentsControllers/exams");

router.post("/dashboard", studentData);
router.post("/student/attendanceAndTardy", studentAttendanceAndTardy );
router.post("/student/exams", getExams);

module.exports = router;