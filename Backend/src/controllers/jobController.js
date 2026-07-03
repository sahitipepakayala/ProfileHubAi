const JobRequirement = require("../models/JobRequirement");
const { analyzeRequirement } = require("../agents/requirementAgent");
const { runMatchingPipeline } = require("../agents/orchestrator");
const { runSemanticMatchingPipeline } = require("../agents/orchestrator");
const { runHybridMatchingPipeline } = require("../agents/orchestrator");
const { draftInvitation } = require("../agents/communicationAgent");
const Candidate = require("../models/Candidate");
const Company = require("../models/Company");
const { analyzeSkillGap } = require("../agents/skillGapAgent");
const { generateInterviewQuestions } = require("../agents/interviewAgent");
const { scoreCandidateAgainstSkills } = require("../agents/matchingAgent");
const { explainMatch } = require("../agents/matchingExplanationAgent");
const Application = require("../models/Application");
const Interview = require("../models/Interview");

// @desc Company creates a new job requirement
// @route POST /api/jobs
const createJob = async (req, res) => {
  try {
    const { rawDescription } = req.body;

    if (!rawDescription || rawDescription.trim() === "") {
      return res.status(400).json({ message: "rawDescription is required" });
    }

    const job = await JobRequirement.create({
      company: req.user.id,
      rawDescription,
    });

    res.status(201).json({ message: "Job requirement created", job });
  } catch (error) {
    res.status(500).json({ message: "Failed to create job", error: error.message });
  }
};

// @desc Company views all of its own job postings
// @route GET /api/jobs/my-jobs
const getMyJobs = async (req, res) => {
  try {
    const jobs = await JobRequirement.find({ company: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
};

// @desc Get a single job by ID (with company details populated)
// @route GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.id).populate(
      "company",
      "companyName industry"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job", error: error.message });
  }
};

// @desc Company deletes its own job posting
// @route DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Security check: only the company that created it can delete it
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own job postings" });
    }

    await job.deleteOne();
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job", error: error.message });
  }
};


// @desc Run the Requirement Analysis Agent on a job posting
// @route POST /api/jobs/:id/analyze
const { generateEmbedding } = require("../services/embeddingService");

// @desc Run the Requirement Analysis Agent on a job posting
// @route POST /api/jobs/:id/analyze
const analyzeJob = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only analyze your own job postings" });
    }

    const analysis = await analyzeRequirement(job.rawDescription);

    job.extractedRoles = analysis.roles || [];
    job.extractedSkills = analysis.skills || [];
    job.experienceRequired = analysis.experienceYears || 0;

    // Generate embedding for this job so candidates can find it via semantic search
    if (job.extractedSkills.length > 0) {
      const skillsText = job.extractedSkills.join(", ");
      const embedding = await generateEmbedding(skillsText);
      job.skillsEmbedding = embedding;
    }

    await job.save();

    res.status(200).json({ message: "Analysis complete", job });
  } catch (error) {
    res.status(500).json({ message: "Analysis failed", error: error.message });
  }
};

// @desc Run the full matching pipeline (search -> match -> rank) for a job
// @route GET /api/jobs/:id/matches
const getJobMatches = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only view matches for your own jobs" });
    }

    const matches = await runMatchingPipeline(job);

    res.status(200).json({ message: "Matches found", count: matches.length, matches });
  } catch (error) {
    res.status(500).json({ message: "Failed to get matches", error: error.message });
  }
};


// @desc Run the SEMANTIC matching pipeline (vector search) for a job
// @route GET /api/jobs/:id/semantic-matches
const getJobSemanticMatches = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only view matches for your own jobs" });
    }

    let matches = await runSemanticMatchingPipeline(job);

    const applications = await Application.find({ job: job._id }).select("candidate");
    const interviews = await Interview.find({ job: job._id }).select("candidate");

    const blockedCandidateIds = new Set([
      ...applications.map((a) => a.candidate.toString()),
      ...interviews.map((i) => i.candidate.toString()),
    ]);

    matches = matches.filter((m) => {
      const candidateId =
        m.candidate?._id?.toString() ||
        m.candidate?.toString() ||
        m.candidateId?.toString() ||
        m._id?.toString();

      return candidateId && !blockedCandidateIds.has(candidateId);
    });

    res.status(200).json({
      message: "Semantic matches found",
      count: matches.length,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get semantic matches",
      error: error.message,
    });
  }
};


// @desc Generate an interview invitation for a specific candidate for a specific job
// @route POST /api/jobs/:id/invite/:candidateId
const generateInvitation = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only invite candidates for your own jobs" });
    }

    const candidate = await Candidate.findById(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const company = await Company.findById(req.user.id);

    const matchedSkills = candidate.skills.filter((skill) =>
      job.extractedSkills.some(
        (reqSkill) => reqSkill.toLowerCase() === skill.toLowerCase()
      )
    );

    const invitation = await draftInvitation(
      candidate.fullName,
      job.extractedRoles,
      matchedSkills.length > 0 ? matchedSkills : candidate.skills.slice(0, 2),
      company.companyName
    );

    // Save invitation to the application so the candidate can see it
    const Application = require("../models/Application");
    await Application.findOneAndUpdate(
      { candidate: candidate._id, job: job._id },
      { invitationMessage: invitation },
      { upsert: false } // only update if application exists
    );

    res.status(200).json({ message: "Invitation drafted", invitation });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate invitation", error: error.message });
  }
};

// @desc Analyze skill gap between a candidate and a specific job
// @route GET /api/jobs/:id/skill-gap/:candidateId
const getSkillGap = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!job.extractedSkills || job.extractedSkills.length === 0) {
      return res.status(400).json({ message: "Job has not been analyzed yet. Run /analyze first." });
    }

    const candidate = await Candidate.findById(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const gapAnalysis = await analyzeSkillGap(
      candidate.skills,
      job.extractedSkills,
      job.extractedRoles
    );

    res.status(200).json({ message: "Skill gap analysis complete", gapAnalysis });
  } catch (error) {
    res.status(500).json({ message: "Skill gap analysis failed", error: error.message });
  }
};

// @desc Generate personalized interview questions for a candidate + job pair
// @route GET /api/jobs/:id/interview-questions/:candidateId
const getInterviewQuestions = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!job.extractedSkills || job.extractedSkills.length === 0) {
      return res.status(400).json({ message: "Job has not been analyzed yet. Run /analyze first." });
    }

    const candidate = await Candidate.findById(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const questions = await generateInterviewQuestions(
      candidate.skills,
      candidate.experienceYears,
      job.extractedRoles,
      job.extractedSkills
    );

    res.status(200).json({ message: "Interview questions generated", questions });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate interview questions", error: error.message });
  }
};

// @desc Explain WHY a specific candidate is (or isn't) a strong match for a specific job
// @route GET /api/jobs/:id/matches/:candidateId/explain
const explainCandidateMatch = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only explain matches for your own jobs" });
    }

    if (!job.extractedSkills || job.extractedSkills.length === 0) {
      return res.status(400).json({ message: "Job has not been analyzed yet. Run /analyze first." });
    }

    const candidate = await Candidate.findById(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
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

// @desc Run the HYBRID matching pipeline (keyword + semantic merged into one score) for a job
// @route GET /api/jobs/:id/hybrid-matches
const getJobHybridMatches = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only view matches for your own jobs" });
    }

    let matches = await runHybridMatchingPipeline(job);

    const applications = await Application.find({ job: job._id }).select("candidate");
    const interviews = await Interview.find({ job: job._id }).select("candidate");

    const blockedCandidateIds = new Set([
      ...applications.map((a) => a.candidate.toString()),
      ...interviews.map((i) => i.candidate.toString()),
    ]);

    matches = matches.filter((m) => {
      const candidateId =
        m.candidate?._id?.toString() ||
        m.candidate?.toString() ||
        m.candidateId?.toString() ||
        m._id?.toString();

      return candidateId && !blockedCandidateIds.has(candidateId);
    });

    res.status(200).json({
      message: "Hybrid matches found",
      count: matches.length,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get hybrid matches",
      error: error.message,
    });
  }
};

// @desc Company manually updates extracted skills and roles for a job
// @route PATCH /api/jobs/:id/skills
// const updateJobSkills = async (req, res) => {
//   try {
//     const { extractedSkills, extractedRoles } = req.body;

//     const job = await JobRequirement.findById(req.params.id);
//     if (!job) {
//       return res.status(404).json({ message: "Job not found" });
//     }

//     if (job.company.toString() !== req.user.id) {
//       return res.status(403).json({ message: "You can only update your own job postings" });
//     }

//     if (extractedSkills !== undefined) {
//       if (!Array.isArray(extractedSkills)) {
//         return res.status(400).json({ message: "extractedSkills must be an array" });
//       }
//       job.extractedSkills = extractedSkills.map((s) => String(s).trim()).filter(Boolean);
//     }

//     if (extractedRoles !== undefined) {
//       if (!Array.isArray(extractedRoles)) {
//         return res.status(400).json({ message: "extractedRoles must be an array" });
//       }
//       job.extractedRoles = extractedRoles.map((r) => String(r).trim()).filter(Boolean);
//     }

//     if (job.extractedSkills.length > 0) {
//       const skillsText = job.extractedSkills.join(", ");
//       const embedding = await generateEmbedding(skillsText);
//       job.skillsEmbedding = embedding;
//     }

//     await job.save();

//     res.status(200).json({ message: "Skills updated", job });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to update skills", error: error.message });
//   }
// };


// @desc Company manually edits extracted skills on an analyzed job + regenerates embedding
// @route PATCH /api/jobs/:id/skills
const updateJobSkills = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: "skills must be a non-empty array" });
    }

    const job = await JobRequirement.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own jobs" });
    }

    // Update the skills
    job.extractedSkills = skills.map((s) => s.trim()).filter(Boolean);

    // Regenerate embedding with the new skill set
    const skillsText = job.extractedSkills.join(", ");
    const embedding = await generateEmbedding(skillsText);
    job.skillsEmbedding = embedding;

    await job.save();

    res.status(200).json({
      message: "Skills updated and embedding regenerated",
      job,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update skills", error: error.message });
  }
};

module.exports = {
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
};