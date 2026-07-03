const express = require("express");
const {
  createJob,
  getMyJobs,
  getJobById,
  deleteJob,
  analyzeJob,
  getJobMatches,
  getJobSemanticMatches,
  getJobHybridMatches,
  generateInvitation,
  getSkillGap,
  getInterviewQuestions,
  explainCandidateMatch,
  updateJobSkills,
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");
const {
  applyToJob,
  getJobApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const {
  scheduleInterview,
  getJobInterviews,
} = require("../controllers/interviewController");
const { getJobDashboard } = require("../controllers/dashboardController");
const {
  sendMessage,
  getJobMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.post("/", protect, restrictTo("company"), createJob);
router.get("/my-jobs", protect, restrictTo("company"), getMyJobs);
router.get("/:id", protect, getJobById);
router.delete("/:id", protect, restrictTo("company"), deleteJob);
router.post("/:id/analyze", protect, restrictTo("company"), analyzeJob);
router.get("/:id/matches", protect, restrictTo("company"), getJobMatches);
router.get("/:id/semantic-matches", protect, restrictTo("company"), getJobSemanticMatches);
router.get("/:id/hybrid-matches", protect, restrictTo("company"), getJobHybridMatches);
router.post("/:id/invite/:candidateId", protect, restrictTo("company"), generateInvitation);
router.get("/:id/skill-gap/:candidateId", protect, getSkillGap);
router.get("/:id/interview-questions/:candidateId", protect, getInterviewQuestions);
router.get("/:id/matches/:candidateId/explain", protect, restrictTo("company"), explainCandidateMatch);
router.put("/:id/skills", protect, restrictTo("company"), updateJobSkills);

// Messaging
router.post("/:id/messages", protect, restrictTo("company"), sendMessage);
router.get("/:id/messages", protect, restrictTo("company"), getJobMessages);

// Application tracking
router.post("/:id/apply", protect, restrictTo("candidate"), applyToJob);
router.get("/:id/applications", protect, restrictTo("company"), getJobApplications);
router.patch("/:id/applications/:applicationId", protect, restrictTo("company"), updateApplicationStatus);

// Interview scheduling
router.post("/:id/applications/:applicationId/interview", protect, restrictTo("company"), scheduleInterview);
router.get("/:id/interviews", protect, restrictTo("company"), getJobInterviews);
router.get("/:id/dashboard", protect, restrictTo("company"), getJobDashboard);

module.exports = router;