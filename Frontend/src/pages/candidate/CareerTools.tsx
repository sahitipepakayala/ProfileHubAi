import { useState } from "react";
import { getResumeFeedback, getCareerGrowthPlan } from "../../api/candidateApi";
import type { ResumeFeedback, CareerGrowthPlan } from "../../types";

type ToolTab = "feedback" | "growth";

export default function CareerTools() {
  const [tab, setTab] = useState<ToolTab>("feedback");
  const [feedback, setFeedback] = useState<ResumeFeedback | null>(null);
  const [growth, setGrowth] = useState<CareerGrowthPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoadFeedback = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getResumeFeedback();
      setFeedback(res.feedback);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || "Failed to get resume feedback.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadGrowth = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCareerGrowthPlan();
      setGrowth(res.plan);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || "Failed to get career growth plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Career Tools</h1>
        <p className="text-gray-500 text-sm mt-1">
          AI-powered tools to improve your resume and plan your career growth.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {([
          { key: "feedback", label: "Resume Feedback" },
          { key: "growth", label: "Career Growth Plan" },
        ] as { key: ToolTab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              tab === key ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "feedback" && (
        <div>
          {!feedback ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Get specific, actionable feedback on your uploaded resume — what's working,
                what's missing, and how to improve your ATS score.
              </p>
              <button
                onClick={handleLoadFeedback}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Analyzing..." : "Analyze My Resume"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">ATS Friendliness Score</h3>
                  <span className={`text-2xl font-bold ${
                    feedback.atsFriendlinessScore >= 75 ? "text-green-600" :
                    feedback.atsFriendlinessScore >= 50 ? "text-amber-600" :
                    "text-red-500"
                  }`}>
                    {feedback.atsFriendlinessScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      feedback.atsFriendlinessScore >= 75 ? "bg-green-500" :
                      feedback.atsFriendlinessScore >= 50 ? "bg-amber-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${feedback.atsFriendlinessScore}%` }}
                  />
                </div>
                <p className="text-sm text-gray-700 mt-3">{feedback.overallImpression}</p>
              </div>

              {feedback.strengths.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">What's Working</h3>
                  <ul className="space-y-1.5">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-green-500 flex-shrink-0">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.improvementSuggestions.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Improvement Suggestions</h3>
                  <div className="space-y-3">
                    {feedback.improvementSuggestions.map((item, i) => (
                      <div key={i} className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-amber-800 mb-1">{item.area}</p>
                        <p className="text-xs text-gray-700">{item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {feedback.missingElements.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Missing Elements</h3>
                  <ul className="space-y-1.5">
                    {feedback.missingElements.map((el, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-red-400 flex-shrink-0">✗</span> {el}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setFeedback(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Re-analyze
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "growth" && (
        <div>
          {!growth ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Get a personalized career growth plan — certifications to pursue, project ideas
                to build, trending skills to learn, and your suggested next role.
              </p>
              <button
                onClick={handleLoadGrowth}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Generating..." : "Generate My Growth Plan"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Where You Stand</h3>
                <p className="text-sm text-gray-700">{growth.careerSummary}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Suggested next role:</span>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    {growth.suggestedNextRole}
                  </span>
                </div>
              </div>

              {growth.recommendedCertifications.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Recommended Certifications</h3>
                  <div className="space-y-2">
                    {growth.recommendedCertifications.map((cert, i) => (
                      <div key={i} className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-800">{cert.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{cert.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {growth.projectIdeas.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Project Ideas</h3>
                  <div className="space-y-3">
                    {growth.projectIdeas.map((idea, i) => (
                      <div key={i} className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-purple-800">{idea.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{idea.whyItHelps}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {idea.skillsItBuilds.map((s) => (
                            <span key={s} className="text-xs px-1.5 py-0.5 bg-white text-purple-700 rounded border border-purple-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {growth.trendingSkillsToLearn.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Trending Skills to Learn</h3>
                  <div className="flex flex-wrap gap-2">
                    {growth.trendingSkillsToLearn.map((skill) => (
                      <span key={skill} className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setGrowth(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Regenerate Plan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
