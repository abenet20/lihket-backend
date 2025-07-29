const express = require("express");
const router = express.Router();
const { studentData } = require("../controllers/studentsControllers/studentData");
const { studentAttendanceAndTardy  } = require("../controllers/studentsControllers/studentAttendanceAndTardy");

router.post("/dashboard", studentData);
router.post("/student/attendanceAndTardy", studentAttendanceAndTardy );

module.exports = router;