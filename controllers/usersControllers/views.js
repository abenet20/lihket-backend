const verifyToken = require("../../middleware/verifyToken.js");
const { body, validationResult } = require("express-validator");
const database = require("../dbControllers/db_connection.js");

exports.viewsCount = [
  body("ItemId").isNumeric().withMessage("ItemId must be a number"),
  verifyToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ItemId } = req.body;
    const userId = req.user.id;

    try {
      // Check if the item exists
      const [item] = await database.query(`SELECT * FROM views WHERE id = ?`, [
        ItemId,
      ]);

      if (item.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        });
      }

      const [viewer] = await database.query(
        `SELECT * FROM viewers WHERE item_id = ? AND user_id = ?`,
        [ItemId, userId]
      );

      if (viewer.length > 0) {
        return;
      }

      // Insert the viewer record
      await database.query(
        `INSERT INTO viewers (item_id, user_id) VALUES (?, ?)`,
        [ItemId, userId]
      );

      // Increment the views count
      await database.query(`UPDATE views SET views = views + 1 WHERE id = ?`, [
        ItemId,
      ]);

      return res.status(200).json({
        success: true,
        message: "Views count updated successfully",
      });
    } catch (error) {
      console.error("Error updating views count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];
