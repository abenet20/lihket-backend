const database = require("../dbControllers/db_connection.js");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const generator = require("generate-password");
const verifyToken = require("../../middleware/verifyToken.js");

exports.addClass = [
  body("grade")
    .isLength({ min: 1 })
    .withMessage("grade must contain atleast 1 number")
    .isNumeric()
    .withMessage("grade mus be a number")
    .trim()
    .notEmpty()
    .withMessage("grade shouldn`t be an empty"),
  body("section")
    .isLength({ min: 1 })
    .withMessage("grade must contain atleast 1 character")
    .trim()
    .notEmpty()
    .withMessage("Section should not be empty")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Section must only contain letters and spaces"),
  verifyToken,
  body("roomTeacher")
    .isLength({ min: 1 })
    .withMessage("Room Teacher id must contain atleast 1 number")
    .isNumeric()
    .withMessage("Room Teacher id must be a number")
    .trim()
    .notEmpty()
    .withMessage("Room Teacher id shouldn`t be an empty"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { grade, section, roomTeacher } = req.body;

    try {
      const [existingClasses] = await database.query("SELECT * FROM classes");
      for (const existingClass of existingClasses) {
        if (
          existingClass.grade == grade &&
          existingClass.section == section
        ) {
          return res.status(400).json({
            message: "class already exists for this grade and section",
            existingClass,
          });
        }
      }

      const className = `${grade}${section}`;
      const [newClass] = await database.query(
        "INSERT INTO classes (`name`, `grade`, `section`, `homeroom_teacher`) VALUES (?,?,?,?)",
        [className, grade, section, roomTeacher]
      );

      return res.status(201).json({
        newClass,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  },
];
