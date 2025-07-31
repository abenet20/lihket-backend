const database = require("../dbControllers/db_connection.js");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const generator = require("generate-password");
const verifyToken = require("../../middleware/verifyToken.js");
const { send } = require("../senders/smsSender.js");

exports.addStudent = [
  verifyToken,
  body("name")
    .isLength({ min: 3 })
    .withMessage("name should contain atleast 3 letters")
    .trim()
    .notEmpty()
    .withMessage("name should not be empty")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("name must only contain letters and spaces"),
  body("phone")
    .isLength({ min: 10 })
    .withMessage("phone should contain 10")
    .isNumeric()
    .withMessage("phone must be number"),
  body("parentName")
    .isLength({ min: 3 })
    .withMessage("name should contain atleast 3 letters")
    .trim()
    .notEmpty()
    .withMessage("name should not be empty")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("name must only contain letters and spaces"),
  body("parentPhone")
    .isLength({ min: 10 })
    .withMessage("phone should contain 10 numbers")
    .isNumeric()
    .withMessage("phone must be number"),
  body("grade")
    .isLength({ min: 1 })
    .withMessage("phone should contain 1 or 2 two numbers"),
  body("studentClass").isLength({ min: 2 }),
  body("gender")
    .isLength({ min: 1 })
    .withMessage("gender should contain 1 letters")
    .trim()
    .notEmpty()
    .withMessage("gender should not be empty")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("gender must only contain letters"),
  body("age")
    .isLength({ min: 2 })
    .withMessage("age should contain atleast 1 number")
    .isNumeric()
    .withMessage("age must be number"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //getting students
    const [students] = await database.query(
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
   WHERE users.role = ? AND users.is_deleted = 0 AND students.is_deleted = 0 AND parents.is_deleted = 0`,
      ["student"]
    );

    const [parents] = await database.query(
      `select users.name AS name,
      users.username AS username, 
      parents.parent_id AS parent_id,
      parents.name AS name,
      parents.phone AS phone
      from users JOIN parents ON parents.user_id = users.user_id
   WHERE users.role = ? AND users.is_deleted = 0 AND parents.is_deleted = 0`,
      ["parent"]
    );

    //getting students
    // const [students] = await database.query("SELECT * FROM students");

    //function which help username
    function generateUsername(name = "user") {
      const cleaned = name.toLowerCase().replace(/\s+/g, "");
      const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
      return `${cleaned}${random}`;
    }

    try {
      const {
        name,
        parentName,
        phone,
        parentPhone,
        grade,
        studentClass,
        gender,
        age,
      } = req.body;

      for (const student of students) {
        if (
          name == student.student_name &&
          grade == student.student_grade &&
          gender == student.student_gender &&
          parentName == student.parent_name &&
          parentPhone == student.parent_phone
        ) {
          return res.status(400).json({
            message: "Student and parent not registered due to duplication",
            student,
          });
        }
      }

      let studentUsername = generateUsername(name);
      let parentUsername = generateUsername(parentName);
      let studentPassword = generator.generate({
        length: 8,
        numbers: true,
        symbols: false,
        uppercase: false,
        lowercase: true,
      });
      let parentPassword = generator.generate({
        length: 8,
        numbers: true,
        symbols: false,
        uppercase: false,
        lowercase: true,
      });
      const studentHashed = await bcrypt.hash(studentPassword, 10);
      const parentHashed = await bcrypt.hash(parentPassword, 10);

      const [userResult] = await database.query(
        "INSERT INTO users (`name`, `username`, `password`, `role`) VALUES (?,?,?,?)",
        [name, studentUsername, studentHashed, "student"]
      );
      const studenetUserId = userResult.insertId;

      let isParentExist = false;
      let parentId = null;
      for (const parent of parents) {
        if (parent.name == parentName && parent.phone == parentPhone) {
          isParentExist = true;
          parentId = parent.parent_id;
          parentUsername = parent.username;
        }
      }

      if (!isParentExist) {
        const [parentUserResult] = await database.query(
          "INSERT INTO users (`name`, `username`, `password`, `role`) VALUES (?,?,?,?)",
          [parentName, parentUsername, parentHashed, "parent"]
        );
        const parentUserId = parentUserResult.insertId;

        const [parentResult] = await database.query(
          "INSERT INTO parents (`user_id`, `name`, `phone`) VALUES (?,?,?)",
          [parentUserId, parentName, parentPhone]
        );
        parentId = parentResult.insertId;
      }

      // const [studentResult] =
      await database.query(
        "INSERT INTO students (`user_id`, `name`,  `age`, `gender`, `phone`, `grade`, `class_id`, `parent_id`) VALUES (?,?,?,?,?,?,?,?)",
        [
          studenetUserId,
          name,
          age,
          gender,
          phone,
          grade,
          studentClass,
          parentId,
        ]
      );

      // Send SMS notifications (assuming a send function is defined)
      send(
        parentPhone,
        `Your child ${name} has been registered successfully with username: ${parentUsername} and password: ${parentPassword}.`
      );
      send(
        phone,
        `You have been registered successfully with username: ${studentUsername} and password: ${studentPassword}.`
      );

      return res.status(201).json({
        message: "Student and parent registered successfully",
        student: { username: studentUsername, password: studentPassword },
        parent: { username: parentUsername, password: parentPassword },
      });
    } catch (error) {
      console.error("Error during student/parent creation:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
];
