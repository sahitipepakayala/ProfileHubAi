const express = require("express");
const cors = require("cors");
const authRoutes = require("./routers/authRoutes");
const companyRoutes = require("./routers/companyRoutes");
const candidateRoutes = require("./routers/candidateRoutes");
const jobRoutes = require("./routers/jobRoutes");

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "ProfileHub AI backend is running ✅" });
});

app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/jobs", jobRoutes);

module.exports = app;