const generateToken = require("../../utils/generationToken");
const database = require("../dbControllers/db_connection");
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
      const [user] = await database.query(
        "SELECT * FROM users WHERE username = ? AND is_deleted = 0",
        [username]
      );

        // ✅ Check if user exists before accessing user[0]
      if (!user.length) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      //compare password
      const isMatch = await bcrypt.compare(password, user[0].password);
      

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      //create JWT token
      const token = generateToken(user[0].user_id);

      res.status(201).json({ success: true, token, role: user[0].role, name: user[0].name, grade: user[0].grade });

      //catch any errors
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];
