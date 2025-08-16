const database = require("../dbControllers/db_connection.js");
const verifyToken = require("../../middleware/verifyToken.js");
const { body, validationResult } = require("express-validator");

exports.announcements = [
  verifyToken,
  async (req, res) => {
    try {
      //getting announcemnts
      const [announcements] = await database.query(`
  SELECT a.ann_id AS id,
  a.title AS title,
  a.content AS content,
  a.audience AS audience,
  a.priority AS priority,
  a.created_at AS createdAt,
  a.status AS status,
  a.targeted_groups AS tagetGroups,
  v.views, 
  users.name AS createdBy,
   users.role as creatorRole
  FROM announcements a
  LEFT JOIN views v ON a.viewId = v.id
  LEFT JOIN users ON a.created_by = users.user_id
  WHERE a.is_deleted = 0
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
  body("content").trim().notEmpty().withMessage("Content cannot be empty"),

  // targeted_groups
  body("targetedGroups")
    .optional()
    .isString()
    .withMessage("Targeted groups must be a string"),

  // title
  body("title").trim().notEmpty().withMessage("Title cannot be empty"),

  // priority (must be one of the allowed values)
  body("priority")
    .optional()
    .isIn(["high", "medium", "low"])
    .withMessage("Priority must be either 'high', 'medium', or 'low'"),

  // audience
  body("audience")
    .optional()
    .isString()
    .withMessage("Audience must be a string"),

  // status
  body("status")
    .optional()
    .isIn(["published", "draft"])
    .withMessage("Status must be either 'published' or 'draft'"),
  verifyToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const createdBy = req.user.id; // Assuming the user ID is stored in req.user.id
    if (!createdBy) {
      return res.status(401).json({ error: "Unauthorized: User ID not found" });
    }

    const { title, content, audience, priority, targetedGroups, status } =
      req.body;
    try {
      //adding announcements
      const [viewResult] = await database.query(
        `INSERT INTO views (views) VALUES (0)`
      );
      await database.query(
        `INSERT INTO announcements (title, content ,created_by, audience, priority, targeted_groups ,status ,viewId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          content,
          createdBy,
          audience,
          priority,
          targetedGroups,
          status,
          viewResult.insertId,
        ]
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
  body("content").trim().notEmpty().withMessage("Content cannot be empty"),

  // targeted_groups
  body("targetedGroups")
    .optional()
    .isString()
    .withMessage("Targeted groups must be a string"),

  // title
  body("title").trim().notEmpty().withMessage("Title cannot be empty"),

  // priority (must be one of the allowed values)
  body("priority")
    .optional()
    .isIn(["high", "medium", "low"])
    .withMessage("Priority must be either 'high', 'medium', or 'low'"),

  // audience
  body("audience")
    .optional()
    .isString()
    .withMessage("Audience must be a string"),

  // status
  body("status")
    .optional()
    .isIn(["published", "draft"])
    .withMessage("Status must be either 'published' or 'draft'"),
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
        `UPDATE announcements 
SET 
    title = ?, 
    content = ?, 
    audience = ?, 
    priority = ?, 
    targeted_groups = ?, 
    status = ? 
WHERE ann_id = ? AND created_by = ?`
,
        [title, content, audience, priority, targetedGroups, status, announcementId, userId]

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
  },
];
