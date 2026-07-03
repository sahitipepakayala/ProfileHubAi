const Message = require("../models/Message");
const Application = require("../models/Application");
const JobRequirement = require("../models/JobRequirement");
const Candidate = require("../models/Candidate");

// @desc Company sends a message to a candidate for a job
// @route POST /api/jobs/:id/messages
const sendMessage = async (req, res) => {
  try {
    const { candidateId, content, type } = req.body;

    if (!candidateId || !content || content.trim() === "") {
      return res.status(400).json({ message: "candidateId and content are required" });
    }

    const job = await JobRequirement.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only send messages for your own jobs" });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const application = await Application.findOne({
      candidate: candidateId,
      job: job._id,
    });

    const message = await Message.create({
      job: job._id,
      application: application?._id || null,
      candidate: candidateId,
      company: job.company,
      senderRole: "company",
      content: content.trim(),
      type: type || "message",
    });

    if (type === "invitation" && application) {
      application.invitationMessage = content.trim();
      application.invitationSentAt = new Date();
      await application.save();
    }

    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

// @desc Company views messages for a job (optionally filtered by candidate)
// @route GET /api/jobs/:id/messages
const getJobMessages = async (req, res) => {
  try {
    const { candidateId } = req.query;

    const job = await JobRequirement.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only view messages for your own jobs" });
    }

    const filter = { job: job._id };
    if (candidateId) filter.candidate = candidateId;

    const messages = await Message.find(filter)
      .populate("candidate", "fullName email")
      .sort({ createdAt: 1 });

    res.status(200).json({ count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
};

// @desc Candidate sends a reply message
// @route POST /api/candidate/me/messages
const sendCandidateMessage = async (req, res) => {
  try {
    const { jobId, content } = req.body;

    if (!jobId || !content || content.trim() === "") {
      return res.status(400).json({ message: "jobId and content are required" });
    }

    const job = await JobRequirement.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const application = await Application.findOne({
      candidate: req.user.id,
      job: jobId,
    });

    const message = await Message.create({
      job: jobId,
      application: application?._id || null,
      candidate: req.user.id,
      company: job.company,
      senderRole: "candidate",
      content: content.trim(),
      type: "message",
    });

    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

// @desc Candidate views all their messages
// @route GET /api/candidate/me/messages
const getMyMessages = async (req, res) => {
  try {
    const messages = await Message.find({ candidate: req.user.id })
      .populate("job", "rawDescription extractedRoles")
      .populate("company", "companyName industry")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
};

// @desc Candidate views messages for a specific job conversation
// @route GET /api/candidate/me/messages/:jobId
const getJobConversation = async (req, res) => {
  try {
    const messages = await Message.find({
      candidate: req.user.id,
      job: req.params.jobId,
    })
      .populate("company", "companyName")
      .sort({ createdAt: 1 });

    // Mark unread company messages as read
    await Message.updateMany(
      { candidate: req.user.id, job: req.params.jobId, senderRole: "company", read: false },
      { read: true }
    );

    res.status(200).json({ count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch conversation", error: error.message });
  }
};

module.exports = {
  sendMessage,
  getJobMessages,
  sendCandidateMessage,
  getMyMessages,
  getJobConversation,
};
