const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    name: "EduNotify Academic Notifications Server",
    version: "1.0.0",
    status: "online",
    documentation: "/api-docs"
  });
});

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "edunotify"
  });
});

router.get("/status", (req, res) => {
  res.status(200).json({
    app: "EduNotify",
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || 5000
  });
});

module.exports = router;
