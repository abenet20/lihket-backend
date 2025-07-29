const express = require("express");
const router = express.Router();
const {attendance} = require('../controllers/teachersControllers/attendance');


router.post('/attendance', attendance);

module.exports = router;