const mongoose = require("mongoose");
const JobRequirement = require("../models/JobRequirement");
const Application = require("../models/Application");
const Interview = require("../models/Interview");

const APPLICATION_STATUSES = ["applied", "shortlisted", "interview", "rejected", "hired"];
const INTERVIEW_STATUSES = ["proposed", "confirmed", "declined", "completed", "cancelled"];

// Turns an aggregate $group result like [{_id:"applied", count:3}] into
// a fixed-shape object with every known status present (defaulting to 0).
const fillCounts = (results, allStatuses) => {
  const counts = Object.fromEntries(allStatuses.map((s) => [s, 0]));
  results.forEach((r) => {
    if (r._id in counts) counts[r._id] = r.count;
  });
  return counts;
};

// @desc Hiring funnel dashboard for a single job (applicant counts by stage + interview stats)
// @route GET /api/jobs/:id/dashboard
const getJobDashboard = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only view the dashboard for your own jobs" });
    }

    const applicationCounts = await Application.aggregate([
      { $match: { job: job._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const interviewCounts = await Interview.aggregate([
      { $match: { job: job._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const funnel = fillCounts(applicationCounts, APPLICATION_STATUSES);
    const totalApplicants = Object.values(funnel).reduce((sum, n) => sum + n, 0);

    res.status(200).json({
      job: {
        id: job._id,
        roles: job.extractedRoles,
        status: job.status,
      },
      totalApplicants,
      funnel,
      interviews: fillCounts(interviewCounts, INTERVIEW_STATUSES),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load job dashboard", error: error.message });
  }
};

// @desc Company-wide hiring dashboard, aggregated across every job the company has posted
// @route GET /api/company/me/dashboard
const getCompanyDashboard = async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.user.id);

    const jobStatusCounts = await JobRequirement.aggregate([
      { $match: { company: companyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const applicationCounts = await Application.aggregate([
      { $match: { company: companyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const jobFunnel = fillCounts(jobStatusCounts, ["open", "closed", "in-progress"]);
    const applicationFunnel = fillCounts(applicationCounts, APPLICATION_STATUSES);

    res.status(200).json({
      totalJobs: Object.values(jobFunnel).reduce((sum, n) => sum + n, 0),
      jobsByStatus: jobFunnel,
      totalApplicants: Object.values(applicationFunnel).reduce((sum, n) => sum + n, 0),
      applicantsByStage: applicationFunnel,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load company dashboard", error: error.message });
  }
};

module.exports = { getJobDashboard, getCompanyDashboard };