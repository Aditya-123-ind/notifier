const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS requests for portal frontend clients
app.use(cors());

// Configure JSON payload body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Register REST API endpoints
app.use("/api", apiRoutes);

// Default base routing
app.get("/", (req, res) => {
  res.status(200).json({
    name: "EduNotify Academic Notifications Server",
    version: "1.0.0",
    status: "online",
    documentation: "/api-docs"
  });
});

// Port listener
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`EduNotify Server listening on port ${PORT}...`);
  console.log(`Access local API endpoints: http://localhost:${PORT}/api`);
  console.log(`=================================================`);
});
