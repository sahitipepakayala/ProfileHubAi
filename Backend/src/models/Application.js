const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRequirement",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true, // denormalized from job.company so company-side queries don't need a join
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "interview", "rejected", "hired", "withdrawn"],
       default: "applied",
    },
    matchScoreAtApply: {
      type: Number, // keyword match score at the moment the candidate applied, for reference
      default: null,
    },
    invitationMessage: {
      type: String,
      default: "",
    },
    invitationSentAt: {
      type: Date,
      default: null,
    },
    withdrawnAt: {
  type: Date,
  default: null,
},
  },
  { timestamps: true }
);

// A candidate can only apply once per job
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);