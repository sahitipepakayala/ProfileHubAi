const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    skills: {
      type: [String], // e.g. ["React", "Node.js", "MongoDB"]
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    resumeText: {
      type: String, // raw extracted text from uploaded resume (used later for embeddings)
      default: "",
    },
    resumeUrl: {
      type: String, // link to stored resume file (e.g. on S3 or local storage)
      default: "",
    },
    careerGoal: {
      type: String,
      trim: true,
    },
    projects: {
      type: [
        {
          title: { type: String, trim: true },
          description: { type: String, trim: true },
        },
      ],
      default: [], // extracted from resume by the Resume Parsing Agent
    },
    strengths: {
      type: [String], // e.g. ["Fast learner", "Strong problem solver"] - extracted from resume
      default: [],
    },
    role: {
      type: String,
      default: "candidate", // used for RBAC
    },
    skillsEmbedding: {
      type: [Number], // 384-dimension vector representing the candidate's skills
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);