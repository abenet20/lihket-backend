const database = require("../dbControllers/db_connection.js");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const generator = require("generate-password");
const verifyToken = require("../../middleware/verifyToken.js");
const { send } = require("express/lib/response.js");

exports.addTeacher = [
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
  body("qualification")
    .isLength({ min: 4 })
    .withMessage("qualification should contain atleast 4 letters")
    .trim()
    .notEmpty()
    .withMessage("qualification should not be empty")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("qualification must only contain letters and spaces"),
  body("assigned_grades")
    .isLength({ min: 5 })
    .withMessage("assigned_grades should contain 5 letters")
    .trim()
    .notEmpty()
    .withMessage("assigned_grades should not be empty"),
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
  body("subjectId")
    .isLength({ min: 1 })
    .withMessage("subject should contain atleast 1 letters")
    .isNumeric()
    .withMessage("subject must be number"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //function which help username
    function generateUsername(name = "user") {
      const cleaned = name.toLowerCase().replace(/\s+/g, "");
      const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
      return `${cleaned}${random}`;
    }

    const [existingTeachers] = await database.query(`SELECT * FROM teachers`);

    try {
      const {
        name,
        phone,
        qualification,
        assigned_grades,
        gender,
        age,
        subjectId,
      } = req.body;

      // Check if the teacher already exists
      for (const teacher of existingTeachers) {
        if (teacher.name === name && teacher.phone === phone) {
          return res.status(400).json({ error: "Teacher already exists" });
        }
      }

      const username = generateUsername(name);
      const password = generator.generate({
        length: 8,
        numbers: true,
        symbols: false,
        uppercase: false,
        lowercase: true,
      });
      const Hashed = await bcrypt.hash(password, 10);

      const [userResult] = await database.query(
        "INSERT INTO users (`name`, `username`, `password`, `role`) VALUES (?,?,?,?)",
        [name, username, Hashed, "teacher"]
      );

      const userId = userResult.insertId;

      await database.query(
        "INSERT INTO teachers (`user_id`, `name`, `gender`, `age`, `phone`, `subject_id`, `qualification`, `assigned_classes`) VALUES (?,?,?,?,?,?,?,?)",
        [
          userId,
          name,
          gender,
          age,
          phone,
          subjectId,
          qualification,
          assigned_grades,
        ]
      );

      // send(phone, `Dear Mr/Ms. ${name} you have been successfully registered to lihket sms. Your username is ${username} and password is ${password}.`);
      return res.status(201).json({
        message: "Teacher registered successfully",
        Teacher: { username: username, password: password },
      });
    } catch (error) {
      console.error("Error during student/parent creation:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
];
