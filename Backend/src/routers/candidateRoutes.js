const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  generateMyEmbedding,
  uploadResume,
  getMyJobMatches,
  explainJobMatch,
  getResumeFeedback,
  getCareerGrowthPlan,
} = require("../controllers/candidateController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { getMyApplications } = require("../controllers/applicationController");
const { getMyInterviews, respondToInterview } = require("../controllers/interviewController");
const {
  sendCandidateMessage,
  getMyMessages,
  getJobConversation,
} = require("../controllers/messageController");
const { withdrawApplication } = require("../controllers/applicationController");

const router = express.Router();

router.get("/me", protect, restrictTo("candidate"), getMyProfile);
router.put("/me", protect, restrictTo("candidate"), updateMyProfile);
router.post("/me/generate-embedding", protect, restrictTo("candidate"), generateMyEmbedding);
router.post("/me/upload-resume", protect, restrictTo("candidate"), upload.single("resume"), uploadResume);
router.get("/me/job-matches", protect, restrictTo("candidate"), getMyJobMatches);
router.get("/me/job-matches/:jobId/explain", protect, restrictTo("candidate"), explainJobMatch);
router.get("/me/applications", protect, restrictTo("candidate"), getMyApplications);
router.get("/me/resume-feedback", protect, restrictTo("candidate"), getResumeFeedback);

// Interview scheduling
router.get("/me/interviews", protect, restrictTo("candidate"), getMyInterviews);
router.put("/me/interviews/:interviewId/respond", protect, restrictTo("candidate"), respondToInterview);
router.put(
  "/me/applications/:applicationId/withdraw",
  protect,
  restrictTo("candidate"),
  withdrawApplication
);// Messaging
router.get("/me/messages", protect, restrictTo("candidate"), getMyMessages);
router.get("/me/messages/:jobId", protect, restrictTo("candidate"), getJobConversation);
router.post("/me/messages", protect, restrictTo("candidate"), sendCandidateMessage);
router.get("/me/career-growth", protect, restrictTo("candidate"), getCareerGrowthPlan);

module.exports = router;