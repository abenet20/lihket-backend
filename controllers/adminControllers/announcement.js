const database = require("../dbControllers/db_connection.js");
const verifyToken = require("../../middleware/verifyToken.js");
const {body, validationResult} = require("express-validator");

exports.announcements = [
  verifyToken,
  async (req, res) => {
    try {
      //getting announcemnts
      const [announcements] = await database.query(`
        SELECT * FROM announcements WHERE is_deleted = 0
        `);

      return res.status(200).json({
        status: true,
        announcements: announcements,
      });
    } catch (error) {
      return res.status(500).json({
        message: "failed to fetch from database",
        error,
      });
    }
  },
];

exports.addAnnouncement = [
  body("announcement")
    .notEmpty()
    .withMessage("Announcement cannot be empty")
    .trim()
    .notEmpty()
    .withMessage("Announcement should not be empty"),
  body("announcedBy")
    .notEmpty()
    .withMessage("Announced by cannot be empty")
    .isNumeric()
    .withMessage("Announced by must be a number"),
  verifyToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { announcement, announcedBy } = req.body;
    try {
      //adding announcements
      await database.query(
        `
         INSERT INTO announcements (announcement , announced_by) VALUES (?, ?)
        `,
        [announcement, announcedBy]
      );

      return res.status(200).json({
        status: true,
        message: "announcement added successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "failed to fetch from database",
        error,
      });
    }
  },
];

exports.deleteAnnouncement = [
  body("announcementId")
    .notEmpty()
    .withMessage("Announcement ID is required")
    .isNumeric()
    .withMessage("Announcement ID must be a number"),
  verifyToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { announcementId } = req.body;
    try {
      //deleting announcements
      await database.query(
        `
         UPDATE announcements SET is_deleted = 1 WHERE ann_id = ?
        `,
        [announcementId]
      );

      return res.status(200).json({
        status: true,
        message: "announcement deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "failed to delete from database",
        error,
      });
    }
  }
];