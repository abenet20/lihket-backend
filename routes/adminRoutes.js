const express = require("express");
const router = express.Router();
const {
  students,
  users,
} = require("../controllers/adminControllers/usersAndStudents");
const { addStudent } = require("../controllers/adminControllers/addStudent");
const {
  attendanceList,
  tardyList,
} = require("../controllers/adminControllers/attendanceAndTardyList");
const { bulkUpload } = require("../controllers/adminControllers/studentsBulkUpload");
const { addTeacher } = require("../controllers/adminControllers/addTeacher");
const { addClass } = require("../controllers/adminControllers/addClass");
const { removeStudent } = require("../controllers/adminControllers/remove");
const { removeTeacher } = require("../controllers/adminControllers/remove");
const {announcements, addAnnouncement, deleteAnnouncement, updateAnnouncement} = require("../controllers/adminControllers/announcement");


router.post("/students", students);
router.post("/add/student", addStudent);
router.post("/users", users);
router.post("/attendanceList", attendanceList);
router.post("/tardyList", tardyList);
router.post("/students/bulkUpload", bulkUpload);
router.post("/add/teacher", addTeacher);
router.post("/add/class", addClass);
router.post("/remove/student", removeStudent);
router.post("/remove/teacher", removeTeacher);
router.post("/announcements", announcements);
router.post("/add/announcement", addAnnouncement);
router.post("/update/announcement", updateAnnouncement);
router.post("/delete/announcement", deleteAnnouncement);


module.exports = router;
