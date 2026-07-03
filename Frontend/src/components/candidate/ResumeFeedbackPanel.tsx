import { getResumeFeedback } from "../../api/candidateApi";
import { useState } from "react";
import type { ResumeFeedback } from "../../types";

// Equivalent to the "feedback" tab content already inline in CareerTools.tsx.
// Not currently used there — available if you want to extract it later, e.g.
// to reuse the panel inside a job detail view too.
export default function ResumeFeedbackPanel() {
  const [feedback, setFeedback] = useState<ResumeFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoad = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getResumeFeedback();
      setFeedback(res.feedback);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to get resume feedback.");
    } finally {
      setLoading(false);
    }
  };

  if (!feedback) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <p className="text-sm text-gray-500 mb-4">
          Get specific, actionable feedback on your uploaded resume.
        </p>
        <button
          onClick={handleLoad}
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Analyzing..." : "Analyze My Resume"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">ATS Friendliness Score</h3>
          <span
            className={`text-2xl font-bold ${
              feedback.atsFriendlinessScore >= 75
                ? "text-green-600"
                : feedback.atsFriendlinessScore >= 50
                ? "text-amber-600"
                : "text-red-500"
            }`}
          >
            {feedback.atsFriendlinessScore}/100
          </span>
        </div>
        <p className="text-sm text-gray-700 mt-1">{feedback.overallImpression}</p>
      </div>

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
    </div>
  );
}