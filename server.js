const express = require("express");
const path = require("path");
const cors = require("cors");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", apiRoutes);

const publicDir = __dirname;
app.use(express.static(publicDir));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "edunotify",
    port: PORT
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// In case a client hits a non-API route that isn't a file, serve the app shell.
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log("=================================================");
  console.log(`EduNotify Server listening on port ${PORT}...`);
  console.log(`Access local app: http://localhost:${PORT}/`);
  console.log(`API endpoints: http://localhost:${PORT}/api`);
  console.log("=================================================");
});
