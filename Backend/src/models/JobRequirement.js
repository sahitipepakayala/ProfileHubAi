const mongoose = require("mongoose");

const jobRequirementSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    rawDescription: {
      type: String,
      required: true,
    },
    extractedRoles: {
      type: [String],
      default: [],
    },
    extractedSkills: {
      type: [String],
      default: [],
    },
    experienceRequired: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["open", "closed", "in-progress"],
      default: "open",
    },
    skillsEmbedding: {
      type: [Number], // 384-dimension vector representing the job's required skills
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobRequirement", jobRequirementSchema);