const database = require("../dbControllers/db_connection.js");
const verifyToken = require("../../middleware/verifyToken.js");
const { body, validationResult } = require("express-validator");

exports.announcements = [
  verifyToken,
  async (req, res) => {
    try {
      //getting announcemnts
      const [announcements] = await database.query(`
  SELECT a.*, v.views, admins.name AS announcedBy
  FROM announcements a
  LEFT JOIN views v ON a.viewId = v.id
  LEFT JOIN admins ON a.announced_by = admins.user_id
  WHERE a.status = 'active' AND a.is_deleted = 0
`);

      if (announcements.length === 0) {
        return res.status(404).json({
          status: false,
          message: "No announcements found",
        });
      }

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
body("status")
    .optional()
    .isIn(["active", "draft"])
    .withMessage("Status must be either 'active' or 'draft'"),
  verifyToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const announcedBy = req.user.id; // Assuming the user ID is stored in req.user.id
    if (!announcedBy) {
      return res.status(401).json({ error: "Unauthorized: User ID not found" });
    }

    const { announcement, status } = req.body;
    try {
      //adding announcements
      const [viewResult] = await database.query(
        `INSERT INTO views (views) VALUES (0)`
      );
      await database.query(
        `INSERT INTO announcements (announcement, announced_by, status ,viewId) VALUES (?, ?, ?, ?)`,
        [announcement, announcedBy, status ,viewResult.insertId]
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
  },
];

exports.updateAnnouncement = [
  body("announcementId")
    .notEmpty()
    .withMessage("Announcement ID is required")
    .isNumeric()
    .withMessage("Announcement ID must be a number"),
  body("announcement")
    .notEmpty()
    .withMessage("Announcement cannot be empty")
    .trim()
    .notEmpty()
    .withMessage("Announcement should not be empty"),
  body("status")
    .optional()
    .isIn(["active", "draft"])
    .withMessage("Status must be either 'active' or 'draft'"),
  verifyToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { announcementId, announcement, status } = req.body;
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User ID not found" });
    }

    try {
      //updating announcements
      await database.query(
        `
         UPDATE announcements SET announcement = ?, status = ? WHERE ann_id = ? AND announced_by = ?
        `,
        [announcement, status, announcementId, userId]
      );

      return res.status(200).json({
        status: true,
        message: "announcement updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "failed to update in database",
        error,
      });
    }
  }
];
