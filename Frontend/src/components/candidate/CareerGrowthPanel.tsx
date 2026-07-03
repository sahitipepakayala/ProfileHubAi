import { useState } from "react";
import { getCareerGrowthPlan } from "../../api/candidateApi";
import type { CareerGrowthPlan } from "../../types";

// Equivalent to the "growth" tab content already inline in CareerTools.tsx.
// Not currently used there — available if you want to extract it later.
export default function CareerGrowthPanel() {
  const [plan, setPlan] = useState<CareerGrowthPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoad = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCareerGrowthPlan();
      setPlan(res.plan);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to get career growth plan.");
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <p className="text-sm text-gray-500 mb-4">
          Get a personalized growth plan — certifications, project ideas, and your suggested next role.
        </p>
        <button
          onClick={handleLoad}
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Generating..." : "Generate My Growth Plan"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Where You Stand</h3>
        <p className="text-sm text-gray-700">{plan.careerSummary}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-500">Suggested next role:</span>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            {plan.suggestedNextRole}
          </span>
        </div>
      </div>

      {plan.recommendedCertifications.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recommended Certifications</h3>
          <div className="space-y-2">
            {plan.recommendedCertifications.map((cert, i) => (
              <div key={i} className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-800">{cert.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">{cert.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan.projectIdeas.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Project Ideas</h3>
          <div className="space-y-3">
            {plan.projectIdeas.map((idea, i) => (
              <div key={i} className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-purple-800">{idea.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{idea.whyItHelps}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}