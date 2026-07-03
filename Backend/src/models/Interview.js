const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRequirement",
      required: true, // denormalized so company-side queries don't need a join
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true, // denormalized so candidate-side queries don't need a join
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    mode: {
      type: String,
      enum: ["video", "phone", "onsite"],
      default: "video",
    },
    meetingDetails: {
      type: String, // meeting link, phone number, or address depending on mode
      default: "",
    },
    status: {
      type: String,
      enum: ["proposed", "confirmed", "declined", "completed", "cancelled"],
      default: "proposed",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);