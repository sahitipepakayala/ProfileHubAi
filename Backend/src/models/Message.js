const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRequirement",
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["company", "candidate"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["invitation", "message"],
      default: "message",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ job: 1, candidate: 1, createdAt: 1 });
messageSchema.index({ candidate: 1, createdAt: -1 });
messageSchema.index({ company: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
