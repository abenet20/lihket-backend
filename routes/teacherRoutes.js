const express = require("express");
const router = express.Router();
const {attendance} = require('../controllers/teachersControllers/attendance');
const { addExam, getExams, deleteExam } = require("../controllers/teachersControllers/exams");
const { attendanceStudentsList } = require("../controllers/teachersControllers/studentsList");


router.post('/attendance', attendance);
router.post("/add-exam", addExam);
router.post("/get-exams", getExams);
router.post("/delete-exam", deleteExam);
router.get("/attendance-students-list", attendanceStudentsList);

module.exports = router;