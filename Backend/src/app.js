const express = require("express");
const cors = require("cors");

const authRoutes = require("./routers/authRoutes");
const companyRoutes = require("./routers/companyRoutes");
const candidateRoutes = require("./routers/candidateRoutes");
const jobRoutes = require("./routers/jobRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "ProfileHub AI backend is running ✅" });
});

app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/jobs", jobRoutes);

module.exports = app;