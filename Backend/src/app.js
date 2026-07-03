const express = require("express");
const cors = require("cors");

const authRoutes = require("./routers/authRoutes");
const companyRoutes = require("./routers/companyRoutes");
const candidateRoutes = require("./routers/candidateRoutes");
const jobRoutes = require("./routers/jobRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://profilehubai.onrender.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "ProfileHub AI backend is running ✅" });
});

app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/jobs", jobRoutes);

module.exports = app;