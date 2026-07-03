const Company = require("../models/Company");

// @desc Get logged-in company's own profile
// @route GET /api/company/me
const getMyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.user.id).select("-password");
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

// @desc Update logged-in company's profile
// @route PUT /api/company/me
const updateMyProfile = async (req, res) => {
  try {
    const { password, email, ...updatableFields } = req.body; 
    // password & email excluded here intentionally — handled separately for security

    const updatedCompany = await Company.findByIdAndUpdate(
      req.user.id,
      updatableFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ message: "Profile updated", company: updatedCompany });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

module.exports = { getMyProfile, updateMyProfile };