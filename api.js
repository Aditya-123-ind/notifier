const express = require("express");
const router = express.Router();

const { verifyToken, isAdmin, isStaff } = require("../middleware/auth");
const notifController = require("../controllers/notifications");

// ==========================================
// Authentication Routes
// ==========================================
router.post("/auth/register", (req, res) => {
  res.status(201).json({ message: "Mock signup parsed successfully. Token generated." });
});

router.post("/auth/login", (req, res) => {
  res.status(200).json({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", user: { email: req.body.email } });
});

router.post("/auth/recover-password", (req, res) => {
  res.status(200).json({ message: "Recovery email verified and password reset successfully." });
});

// ==========================================
// Notifications & Feed Routes
// ==========================================
router.get("/notifications/feed", verifyToken, notifController.getFeed);
router.post("/notifications", verifyToken, isStaff, notifController.createNotification);

router.put("/notifications/:id", verifyToken, isStaff, (req, res) => {
  res.status(200).json({ message: "Notice circular entry updated successfully." });
});

router.delete("/notifications/:id", verifyToken, isStaff, (req, res) => {
  res.status(200).json({ message: "Notice circular deleted from registry." });
});

router.post("/notifications/:notifId/read", verifyToken, notifController.markAsRead);
router.post("/notifications/:notifId/feedback", verifyToken, notifController.addFeedback);

// ==========================================
// Administration & Approvals Routes
// ==========================================
router.get("/admin/teachers/pending", verifyToken, isAdmin, (req, res) => {
  res.status(200).json({ pending: [] });
});

router.put("/admin/teachers/:userId/approve", verifyToken, isAdmin, (req, res) => {
  res.status(200).json({ message: "Teacher account registration state set to Approved." });
});

router.get("/admin/users", verifyToken, isAdmin, (req, res) => {
  res.status(200).json({ users: [] });
});

router.post("/admin/users", verifyToken, isAdmin, (req, res) => {
  res.status(201).json({ message: "User account generated successfully." });
});

// ==========================================
// Category Routes
// ==========================================
router.get("/categories/academics", verifyToken, (req, res) => {
  res.status(200).json({ 
    category: "academics",
    items: [
      { id: 1, title: "Semester Timetable", description: "View your class schedule" },
      { id: 2, title: "Syllabus", description: "Course materials and syllabus" },
      { id: 3, title: "Academic Calendar", description: "Important dates" }
    ]
  });
});

router.get("/categories/events", verifyToken, (req, res) => {
  res.status(200).json({ 
    category: "events",
    items: [
      { id: 1, title: "Tech Fest 2026", description: "Annual technology fest" },
      { id: 2, title: "Sports Day", description: "Inter-college sports" },
      { id: 3, title: "Cultural Night", description: "Cultural performances" }
    ]
  });
});

router.get("/categories/placements", verifyToken, (req, res) => {
  res.status(200).json({ 
    category: "placements",
    items: [
      { id: 1, title: "Active Openings", description: "Latest job opportunities" },
      { id: 2, title: "Company Timelines", description: "Recruitment schedules" },
      { id: 3, title: "Internships", description: "Internship programs" }
    ]
  });
});

router.get("/categories/achievements", verifyToken, (req, res) => {
  res.status(200).json({ 
    category: "achievements",
    items: [
      { id: 1, title: "Student Awards", description: "Student recognitions" },
      { id: 2, title: "Success Stories", description: "Alumni achievements" },
      { id: 3, title: "Faculty Excellence", description: "Faculty publications" }
    ]
  });
});

router.get("/categories/circulars", verifyToken, (req, res) => {
  res.status(200).json({ 
    category: "circulars",
    items: [
      { id: 1, title: "Official Notices", description: "Important circulars" },
      { id: 2, title: "Holiday Calendar", description: "Leave and holidays" },
      { id: 3, title: "Administrative", description: "Fee and registration notices" }
    ]
  });
});

module.exports = router;
