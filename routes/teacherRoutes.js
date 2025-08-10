const express = require("express");
const router = express.Router();
const {attendance} = require('../controllers/teachersControllers/attendance');
const { addExam, getExams, deleteExam } = require("../controllers/teachersControllers/exams");
const { attendanceStudentsList } = require("../controllers/teachersControllers/studentsList");
const {addMarkDetails} = require("../controllers/teachersControllers/addMark");
const { addStudentsScores } = require("../controllers/teachersControllers/addStudentsScores.");
const { getMarkList } = require("../controllers/teachersControllers/markList");


router.post('/attendance', attendance);
router.post("/add-exam", addExam);
router.post("/get-exams", getExams);
router.post("/delete-exam", deleteExam);
router.get("/attendance-students-list", attendanceStudentsList);
router.post("/add-marks", addMarkDetails);
router.post("/add-students-scores", addStudentsScores);
router.get("/mark-list", getMarkList);

module.exports = router;