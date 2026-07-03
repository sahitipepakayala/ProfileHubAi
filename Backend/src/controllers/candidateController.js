const Candidate = require("../models/Candidate");
const JobRequirement = require("../models/JobRequirement");
const { generateEmbedding } = require("../services/embeddingService");
const { extractTextFromPDF } = require("../services/resumeParseService");
const { parseResume } = require("../agents/resumeAgent");
const { generateResumeFeedback } = require("../agents/resumeFeedbackAgent");
const { generateCareerGrowthPlan } = require("../agents/Careergrowthagent");
const { findMatchingJobs } = require("../agents/candidateSearchAgent");
const { scoreCandidateAgainstSkills } = require("../agents/matchingAgent");
const { explainMatch } = require("../agents/matchingExplanationAgent");

// @desc Get logged-in candidate's own profile
// @route GET /api/candidate/me
const getMyProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id).select("-password");
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

// @desc Update logged-in candidate's profile
// @route PUT /api/candidate/me
const updateMyProfile = async (req, res) => {
  try {
    const { password, email, ...updatableFields } = req.body;

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.user.id,
      updatableFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({ message: "Profile updated", candidate: updatedCandidate });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// @desc Generate/refresh embedding vector for the logged-in candidate's skills
// @route POST /api/candidate/me/generate-embedding
const generateMyEmbedding = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (!candidate.skills || candidate.skills.length === 0) {
      return res.status(400).json({ message: "Add skills to your profile before generating embedding" });
    }

    const skillsText = candidate.skills.join(", ");
    const embedding = await generateEmbedding(skillsText);

    candidate.skillsEmbedding = embedding;
    await candidate.save();

    res.status(200).json({ message: "Embedding generated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate embedding", error: error.message });
  }
};


// @desc Upload resume, extract text, parse with AI agent, and auto-update profile
// @route POST /api/candidate/me/upload-resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded. Attach a PDF as 'resume'." });
    }

    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Step 1: Extract raw text from the PDF
    const resumeText = await extractTextFromPDF(req.file.buffer);

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ message: "Could not extract readable text from this PDF" });
    }

    // Step 2: Run the Resume Parsing Agent on the extracted text
    const parsed = await parseResume(resumeText);

    // Step 3: Update candidate profile with extracted data
    candidate.resumeText = resumeText;
    candidate.skills = parsed.skills && parsed.skills.length > 0 ? parsed.skills : candidate.skills;
    candidate.experienceYears = parsed.experienceYears ?? candidate.experienceYears;
    candidate.careerGoal = parsed.careerGoal || candidate.careerGoal;
    candidate.projects = parsed.projects && parsed.projects.length > 0 ? parsed.projects : candidate.projects;
    candidate.strengths = parsed.strengths && parsed.strengths.length > 0 ? parsed.strengths : candidate.strengths;

    // Step 4: Regenerate embedding since skills likely changed
    const skillsText = candidate.skills.join(", ");
    const embedding = await generateEmbedding(skillsText);
    candidate.skillsEmbedding = embedding;

    await candidate.save();

    res.status(200).json({
      message: "Resume processed and profile updated successfully",
      extracted: parsed,
      candidate: {
        fullName: candidate.fullName,
        skills: candidate.skills,
        experienceYears: candidate.experienceYears,
        careerGoal: candidate.careerGoal,
        projects: candidate.projects,
        strengths: candidate.strengths,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Resume processing failed", error: error.message });
  }
};

// @desc Find jobs that semantically match the logged-in candidate's skills
// @route GET /api/candidate/me/job-matches
const getMyJobMatches = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (!candidate.skillsEmbedding || candidate.skillsEmbedding.length === 0) {
      return res.status(400).json({
        message: "Generate your embedding first (update skills or upload resume) before searching for jobs",
      });
    }

    const matches = await findMatchingJobs(candidate.skillsEmbedding, 10);

    res.status(200).json({ message: "Job matches found", count: matches.length, matches });
  } catch (error) {
    res.status(500).json({ message: "Failed to find job matches", error: error.message });
  }
};

// @desc Explain WHY a specific job is (or isn't) a strong match for the logged-in candidate
// @route GET /api/candidate/me/job-matches/:jobId/explain
const explainJobMatch = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const job = await JobRequirement.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!job.extractedSkills || job.extractedSkills.length === 0) {
      return res.status(400).json({ message: "This job hasn't been analyzed by the company yet" });
    }

    const { matchScore, matchedSkills, missingSkills } = scoreCandidateAgainstSkills(
      candidate.skills,
      job.extractedSkills
    );

    const explanation = await explainMatch({
      candidateName: candidate.fullName,
      candidateExperience: candidate.experienceYears,
      jobRoles: job.extractedRoles,
      matchScore,
      matchedSkills,
      missingSkills,
    });

    res.status(200).json({
      message: "Match explanation generated",
      matchScore,
      matchedSkills,
      missingSkills,
      explanation,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to explain match", error: error.message });
  }
};

// @desc Get AI feedback/critique on the logged-in candidate's uploaded resume
// @route GET /api/candidate/me/resume-feedback
const getResumeFeedback = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (!candidate.resumeText || candidate.resumeText.trim().length < 20) {
      return res.status(400).json({
        message: "Upload a resume first (POST /api/candidate/me/upload-resume) before requesting feedback",
      });
    }

    const feedback = await generateResumeFeedback(candidate.resumeText, candidate.careerGoal);

    res.status(200).json({ message: "Resume feedback generated", feedback });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate resume feedback", error: error.message });
  }
};

// @desc Get AI-generated career growth suggestions (certifications, projects, learning path)
// @route GET /api/candidate/me/career-growth
const getCareerGrowthPlan = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (!candidate.skills || candidate.skills.length === 0) {
      return res.status(400).json({
        message: "Add skills to your profile (or upload a resume) before requesting a growth plan",
      });
    }

    const plan = await generateCareerGrowthPlan(
      candidate.skills,
      candidate.experienceYears,
      candidate.careerGoal
    );

    res.status(200).json({ message: "Career growth plan generated", plan });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate career growth plan", error: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  generateMyEmbedding,
  uploadResume,
  getMyJobMatches,
  explainJobMatch,
  getResumeFeedback,
  getCareerGrowthPlan,
};