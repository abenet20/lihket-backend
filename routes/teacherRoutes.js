const express = require("express");
const router = express.Router();
const {attendance} = require('../controllers/teachersControllers/attendance');
const { addExam, getExams, deleteExam } = require("../controllers/teachersControllers/exams");


router.post('/attendance', attendance);
router.post("/add-exam", addExam);
router.post("/get-exams", getExams);
router.post("/delete-exam", deleteExam);

module.exports = router;