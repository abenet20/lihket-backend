const xlsx = require("xlsx");
const path = require("path");
const express = require("express");
const generator = require("generate-password");
const database = require("../dbControllers/db_connection.js");
const verifyToken = require("../../middleware/verifyToken.js");
const bcrypt = require("bcrypt");
const {send} = require("../senders/smsSender.js");
const multer = require('multer');

// Use memory storage instead of disk
const upload = multer({ storage: multer.memoryStorage() });

exports.bulkUpload = [
  verifyToken,
  upload.single('excelFile'),
  async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

    // const workbook = xlsx.readFile(
      // path.join(__dirname, "../../lihket_students_upload_template.xlsx")
    //   req.file.buffer, { type: 'buffer' }
    // );
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    function generateUsername(name = "user") {
      const cleaned = name.toLowerCase().replace(/\s+/g, "");
      const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
      return `${cleaned}${random}`;
    }

    data.forEach((item) => {
      item.studentPassword = generator.generate({
        length: 6,
        numbers: true,
        symbols: false,
        uppercase: false,
        lowercase: true,
      });

      item.studentUsername = generateUsername(item.name);

      item.parentUsername = generateUsername(item.parentName);
      item.parentPassword = generator.generate({
        length: 6,
        numbers: true,
        symbols: false,
        uppercase: false,
        lowercase: true,
      });
    });
    //function which helps to create new xlsx file
    const createNewXlsx = (inputData, fileName) => {
      const newWorksheet = xlsx.utils.json_to_sheet(inputData);
      const newWorkbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, "sheet1");

      xlsx.writeFile(newWorkbook, fileName);
      console.log("excel file created:", fileName);
    };

    let registered = [];
    let unregistered = [];

    //getting students
    const [existingStudents] = await database.query(
      `SELECT  users.user_id AS user_user_id,
      users.name AS user_name,
      users.username AS user_username,
      users.role AS user_role,
      students.student_id AS student_student_id,
      students.name AS student_name,
      students.age AS student_age,
      students.gender AS student_gender,
      students.phone AS student_phone,
      students.grade AS student_grade,
      students.class_id AS student_class,
      parents.parent_id AS parent_parent_id,
      parents.name AS parent_name,
      parents.phone AS parent_phone
   FROM users
   JOIN students ON students.user_id = users.user_id
   JOIN parents ON parents.parent_id = students.parent_id
   WHERE users.role = ?`,
      ["student"]
    );

    const [parents] = await database.query(
      `select users.name AS name,
        users.username AS username, 
        parents.parent_id AS parent_id,
        parents.name AS name,
        parents.phone AS phone
        from users JOIN parents ON parents.user_id = users.user_id
     WHERE users.role = ?`,
      ["parent"]
    );

    for (const student of data) {
      let isDuplicate = false;
      for (const existingStudent of existingStudents) {
        if (
          student.name === existingStudent.student_name &&
          student.grade === existingStudent.student_grade &&
          student.parentName === existingStudent.parent_name &&
          student.parentPhone === existingStudent.parent_phone
        ) {
          unregistered.push(student);
          isDuplicate = true;
          break;
        }
      }
      if (isDuplicate) continue;
      const studentHashed = await bcrypt.hash(student.studentPassword, 10);
      const parentHashed = await bcrypt.hash(student.parentPassword, 10);

    
      const [userResult] = await database.query(
        "INSERT INTO users (`name`, `username`, `password`, `role`) VALUES (?,?,?,?)",
        [student.name, student.studentUsername, studentHashed, "student"]
      );
      const studenetUserId = userResult.insertId;

      let isParentExist = false;
      let parentId = null;
      for (const parent of parents) {
        if (parent.name == student.parentName && parent.phone == student.parentPhone) {
          isParentExist = true;
          parentId = parent.parent_id;
          parentUsername = parent.username;
        }
      }

      if (!isParentExist) {
        const [parentUserResult] = await database.query(
          "INSERT INTO users (`name`, `username`, `password`, `role`) VALUES (?,?,?,?)",
          [student.parentName, student.parentUsername, parentHashed, "parent"]
        );
        const parentUserId = parentUserResult.insertId;

        const [parentResult] = await database.query(
          "INSERT INTO parents (`user_id`, `name`, `phone`) VALUES (?,?,?)",
          [parentUserId, student.parentName, student.parentPhone]
        );
        parentId = parentResult.insertId;
      }

      // const [studentResult] =
      await database.query(
        "INSERT INTO students (`user_id`, `name`,  `age`, `gender`, `phone`, `grade`, `class_id`, `parent_id`) VALUES (?,?,?,?,?,?,?,?)",
        [
          studenetUserId,
          student.name,
          student.age,
          student.gender,
          student.phone,
          student.grade,
          student.studentClass,
          parentId,
        ]
      );

      send(
        student.parentPhone,
        `Your child ${student.name} has been registered successfully with username: ${student.parentUsername} and password: ${student.parentPassword}.`
      );
      send(
        student.phone,
        `You have been registered successfully with username: ${student.studentUsername} and password: ${student.studentPassword}.`
      );
      registered.push(student);
      
    }

    createNewXlsx(registered, "registered students.xlsx");
    createNewXlsx(unregistered, "unregistered students.xlsx");
    return res.status(201).json({
      message: "completed",
      "registered students.xlsx": registered,
      "unregistered students.xlsx": unregistered,
    });
  },
];
