const express = require("express");
const router = express.Router();
const { parentStudentsList } = require("../controllers/parentsController/parentStudentsList");

router.post("/dashboard", parentStudentsList);

module.exports = router;