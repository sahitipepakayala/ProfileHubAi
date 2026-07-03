const Interview = require("../models/Interview");
const Application = require("../models/Application");
const JobRequirement = require("../models/JobRequirement");

const VALID_MODES = ["video", "phone", "onsite"];
const VALID_RESPONSES = ["confirmed", "declined"];

const scheduleInterview = async (req, res) => {
  try {
    const { scheduledAt, mode, meetingDetails, notes } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({ message: "scheduledAt is required (ISO date string)" });
    }

    const parsedDate = new Date(scheduledAt);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "scheduledAt must be a valid date" });
    }

    if (parsedDate < new Date()) {
      return res.status(400).json({ message: "scheduledAt must be in the future" });
    }

    if (mode && !VALID_MODES.includes(mode)) {
      return res.status(400).json({ message: `mode must be one of: ${VALID_MODES.join(", ")}` });
    }

    const job = await JobRequirement.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only schedule interviews for your own jobs" });
    }

    const application = await Application.findOne({
      _id: req.params.applicationId,
      job: job._id,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found for this job" });
    }

    const existingInterview = await Interview.findOne({
      job: job._id,
      candidate: application.candidate,
      company: job.company,
    });

    if (existingInterview) {
      return res.status(400).json({
        message: "Interview already exists for this candidate for this job",
        interview: existingInterview,
      });
    }

    const interview = await Interview.create({
      application: application._id,
      job: job._id,
      candidate: application.candidate,
      company: job.company,
      scheduledAt: parsedDate,
      mode: mode || "video",
      meetingDetails: meetingDetails || "",
      notes: notes || "",
      status: "proposed",
    });

    application.status = "interview";
    await application.save();

    res.status(201).json({ message: "Interview scheduled", interview });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Interview already exists for this candidate for this job",
      });
    }

    res.status(500).json({ message: "Failed to schedule interview", error: error.message });
  }
};

const getJobInterviews = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only view interviews for your own jobs" });
    }

    const interviews = await Interview.find({ job: job._id })
      .populate("candidate", "fullName email")
      .sort({ scheduledAt: 1 });

    res.status(200).json({ count: interviews.length, interviews });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interviews", error: error.message });
  }
};

const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ candidate: req.user.id })
      .populate("job", "rawDescription extractedRoles")
      .populate("company", "companyName industry")
      .sort({ scheduledAt: 1 });

    res.status(200).json({ count: interviews.length, interviews });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interviews", error: error.message });
  }
};

const respondToInterview = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response || !VALID_RESPONSES.includes(response)) {
      return res.status(400).json({
        message: `response must be one of: ${VALID_RESPONSES.join(", ")}`,
      });
    }

    const interview = await Interview.findOne({
      _id: req.params.interviewId,
      candidate: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.status !== "proposed") {
      return res.status(400).json({
        message: `This interview has already been responded to (current status: ${interview.status})`,
      });
    }

    interview.status = response;
    await interview.save();

    res.status(200).json({ message: `Interview ${response}`, interview });
  } catch (error) {
    res.status(500).json({ message: "Failed to respond to interview", error: error.message });
  }
};

module.exports = {
  scheduleInterview,
  getJobInterviews,
  getMyInterviews,
  respondToInterview,
};