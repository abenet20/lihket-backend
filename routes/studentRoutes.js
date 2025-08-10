const express = require("express");
const router = express.Router();
const { studentData } = require("../controllers/studentsControllers/studentData");
const { studentAttendanceAndTardy  } = require("../controllers/studentsControllers/studentAttendanceAndTardy");
const { getExams } = require("../controllers/studentsControllers/exams");
const {marksList} = require("../controllers/studentsControllers/marks");

router.post("/dashboard", studentData);
router.post("/student/attendanceAndTardy", studentAttendanceAndTardy );
router.post("/student/exams", getExams);
router.get("/student-marks", marksList);

module.exports = router;