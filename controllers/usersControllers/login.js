const generateToken = require("../../utils/generationToken");
const database = require("../dbControllers/db_mysql");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

exports.login = [
  body("username").isLength({ min: 5 }).withMessage("Username is required"),
  body("password").isLength({ min: 6 }).withMessage("Password is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      //check if user exists in the database
      database.query(
        "SELECT * FROM users WHERE username = ? AND is_deleted = 0",
        [username],
        (err, results) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
          }
          const user = results[0];
          if (!user) {
            return res.status(401).json({ error: "Invalid username" });
          }

          //compare password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              console.log(err);
              return res
                .status(500)
                .json({ error: "Error comparing passwords" });
            }

            if (!isMatch) {
              return res
                .status(401)
                .json({ error: "Invalid username or password" });
            }

            //create JWT token
            const token = generateToken(user.user_id);

            res.status(201).json({success: true , token, role: user.role});
          });
        }
      );
      //catch any errors
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];
