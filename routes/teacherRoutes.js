const express = require("express");
const router = express.Router();
const {attendance} = require('../controllers/teachersControllers/attendance');
const { addExam } = require("../controllers/teachersControllers/exams");


router.post('/attendance', attendance);
router.post("/add-exam", addExam);

module.exports = router;