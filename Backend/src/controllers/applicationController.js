const Application = require("../models/Application");
const JobRequirement = require("../models/JobRequirement");
const Candidate = require("../models/Candidate");
const { scoreCandidateAgainstSkills } = require("../agents/matchingAgent");

const VALID_STATUSES = ["applied", "shortlisted", "interview", "rejected", "hired", "withdrawn"];

// @desc Candidate applies to a job
// @route POST /api/jobs/:id/apply
const applyToJob = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "open") {
      return res.status(400).json({ message: "This job is no longer accepting applications" });
    }

    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Snapshot the match score at time of applying, if the job has been analyzed
    let matchScoreAtApply = null;
    if (job.extractedSkills && job.extractedSkills.length > 0) {
      const { matchScore } = scoreCandidateAgainstSkills(candidate.skills, job.extractedSkills);
      matchScoreAtApply = matchScore;
    }

    const application = await Application.create({
      candidate: candidate._id,
      job: job._id,
      company: job.company,
      matchScoreAtApply,
    });

    res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already applied to this job" });
    }
    res.status(500).json({ message: "Failed to apply", error: error.message });
  }
};

// @desc Candidate views all of their own applications
// @route GET /api/candidate/me/applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate("job", "rawDescription extractedRoles extractedSkills status")
      .populate("company", "companyName industry")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications", error: error.message });
  }
};

// @desc Company views all applicants for one of its jobs
// @route GET /api/jobs/:id/applications
const getJobApplications = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only view applicants for your own jobs" });
    }

    const applications = await Application.find({ job: job._id })
      .populate(
        "candidate",
        "fullName email skills experienceYears careerGoal projects strengths resumeUrl"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({ count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applicants", error: error.message });
  }
};

// @desc Company updates an applicant's status (shortlist / interview / reject / hire)
// @route PATCH /api/jobs/:id/applications/:applicationId
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const job = await JobRequirement.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only manage applicants for your own jobs" });
    }

    const application = await Application.findOne({
      _id: req.params.applicationId,
      job: job._id,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found for this job" });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ message: "Application status updated", application });
  } catch (error) {
    res.status(500).json({ message: "Failed to update application status", error: error.message });
  }
};
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.applicationId,
      candidate: req.user.id,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status === "withdrawn") {
      return res.status(400).json({ message: "Application already withdrawn" });
    }

    if (["hired", "rejected"].includes(application.status)) {
      return res.status(400).json({
        message: `Cannot withdraw application with status ${application.status}`,
      });
    }

    application.status = "withdrawn";
    application.withdrawnAt = new Date();

    await application.save();

    res.status(200).json({
      message: "Application withdrawn successfully",
      application,
    });
  } catch (error) {
    console.error("Withdraw application backend error:", error);

    res.status(500).json({
      message: "Failed to withdraw application",
      error: error.message,
    });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
};