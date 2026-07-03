const express = require("express");
const { getMyProfile, updateMyProfile } = require("../controllers/companyController");
const { getCompanyDashboard } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/me", protect, restrictTo("company"), getMyProfile);
router.put("/me", protect, restrictTo("company"), updateMyProfile);
router.get("/me/dashboard", protect, restrictTo("company"), getCompanyDashboard);

module.exports = router;