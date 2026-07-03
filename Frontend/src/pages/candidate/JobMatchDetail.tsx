import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getJobMatches,
  explainJobMatch,
} from "../../api/candidateApi";
import { applyToJob, getInterviewQuestions } from "../../api/jobsApi";
import type {
  JobMatch,
  MatchExplanation,
  SkillGapResult,
  InterviewQuestionsResult,
} from "../../types";
import Loader from "../../components/common/Loader";

export default function JobMatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [explanation, setExplanation] = useState<MatchExplanation | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGapResult | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestionsResult | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      try {
        // Find this job from the matches list
        const res = await getJobMatches();
        const found = res.matches.find((m) => m._id === id);
        if (found) {
          setJob(found);
          // Auto-load explanation
          const explainRes = await explainJobMatch(id);
          setExplanation(explainRes.explanation);
        } else {
          setError("Job not found in your matches.");
        }
      } catch {
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleLoadSkillGap = async () => {
    if (!id) return;
    setLoadingSection("gap");
    try {
      // We need the candidate ID — but since this is the candidate's own view,
      // we get it from the auth context indirectly through the API
      // The skill-gap endpoint needs candidateId, so we use the explanation endpoint
      // which already has the data in a slightly different form.
      // For now we re-call explainJobMatch which gives matched/missing, then format:
      const res = await explainJobMatch(id);
      setSkillGap({
        matchedSkills: res.matchedSkills,
        missingSkills: res.missingSkills,
        gapAnalysis: [],
        overallReadiness: res.explanation.summary,
      });
    } catch {
      setError("Failed to load skill gap.");
    } finally {
      setLoadingSection(null);
    }
  };

  const handleLoadInterviewQuestions = async () => {
    if (!id) return;
    setLoadingSection("questions");
    try {
      // Get candidate ID from profile
      const profileRes = await import("../../api/candidateApi").then((m) => m.getMyProfile());
      const questionsRes = await getInterviewQuestions(id, profileRes._id);
      setQuestions(questionsRes.questions);
    } catch {
      setError("Failed to generate interview questions.");
    } finally {
      setLoadingSection(null);
    }
  };

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    setError("");
    try {
      await applyToJob(id);
      setApplied(true);
      setSuccess("Application submitted successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to apply.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Loader />;
  if (!job) return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-center">
      <p className="text-gray-400">{error || "Job not found."}</p>
      <button onClick={() => navigate("/candidate")} className="mt-4 text-blue-600 text-sm hover:underline">
        ← Back to dashboard
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/candidate")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
      >
        ← Back to matches
      </button>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Job header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {job.extractedRoles?.join(", ") || "Role"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {job.companyDetails?.companyName}
              {job.companyDetails?.industry ? ` · ${job.companyDetails.industry}` : ""}
            </p>
            <p className="text-sm text-gray-600 mt-3">{job.rawDescription}</p>
          </div>
          <div className="text-right">
            <span className={`text-lg font-bold ${
              job.matchPercentage >= 80 ? "text-green-600" :
              job.matchPercentage >= 60 ? "text-amber-600" :
              "text-red-500"
            }`}>
              {job.matchPercentage}%
            </span>
            <p className="text-xs text-gray-400">match</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {job.extractedSkills?.map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-5">
          <button
            onClick={handleApply}
            disabled={applying || applied}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              applied
                ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            }`}
          >
            {applied ? "✓ Applied" : applying ? "Applying..." : "Apply Now"}
          </button>
        </div>
      </div>

      {/* Match explanation */}
      {explanation && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Why You Match This Role
          </h2>
          <p className="text-sm text-gray-700 mb-3">{explanation.summary}</p>
          {explanation.strengths.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-green-700 mb-1.5">Your Strengths</p>
              <ul className="space-y-1">
                {explanation.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2">
                    <span className="text-green-500">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {explanation.considerations.length > 0 && (
            <div>
              <p className="text-xs font-medium text-amber-700 mb-1.5">Things to Note</p>
              <ul className="space-y-1">
                {explanation.considerations.map((c, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2">
                    <span className="text-amber-500">⚠</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Skill gap */}
      {skillGap ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Skill Gap</h2>
          {skillGap.matchedSkills.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-green-700 mb-1.5">You Have</p>
              <div className="flex flex-wrap gap-1.5">
                {skillGap.matchedSkills.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {skillGap.missingSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-600 mb-1.5">Still Needed</p>
              <div className="flex flex-wrap gap-1.5">
                {skillGap.missingSkills.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleLoadSkillGap}
          disabled={loadingSection === "gap"}
          className="w-full mb-5 py-3 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-2xl hover:bg-blue-100 transition-colors"
        >
          {loadingSection === "gap" ? "Loading..." : "View Skill Gap"}
        </button>
      )}

      {/* Interview questions */}
      {questions ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Interview Prep</h2>
          <div className="space-y-2 mb-4">
            {questions.technicalQuestions.map((q, i) => (
              <div key={i} className="text-xs bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-600">{q.skillTested}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    q.difficulty === "advanced" ? "text-red-600 bg-red-50" :
                    q.difficulty === "intermediate" ? "text-amber-600 bg-amber-50" :
                    "text-green-600 bg-green-50"
                  }`}>{q.difficulty}</span>
                </div>
                <p className="text-gray-800">{q.question}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700 bg-blue-50 rounded-lg p-2.5">
            💡 {questions.preparationTip}
          </p>
        </div>
      ) : (
        <button
          onClick={handleLoadInterviewQuestions}
          disabled={loadingSection === "questions"}
          className="w-full mb-5 py-3 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-2xl hover:bg-purple-100 transition-colors"
        >
          {loadingSection === "questions" ? "Generating..." : "Generate Interview Questions"}
        </button>
      )}
    </div>
  );
}