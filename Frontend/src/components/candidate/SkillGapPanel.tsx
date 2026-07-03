import { useState } from "react";
import { getSkillGap } from "../../api/jobsApi";
import { useAuth } from "../../context/AuthContext";
import type { SkillGapResult } from "../../types";

interface SkillGapPanelProps {
  jobId: string;
}

// JobMatchDetail.tsx currently gets skill-gap-like data by re-calling
// explainJobMatch (a clever workaround since the candidate doesn't easily
// have their own id in that file). This component calls the real
// GET /jobs/:jobId/skill-gap/:candidateId endpoint directly using the id
// already available from AuthContext. Not currently used — available as a
// more direct alternative.
export default function SkillGapPanel({ jobId }: SkillGapPanelProps) {
  const { user } = useAuth();
  const [gap, setGap] = useState<SkillGapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoad = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await getSkillGap(jobId, user.id);
      setGap(res.gapAnalysis);
    } catch {
      setError("Failed to load skill gap.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>;
  }

  if (!gap) {
    return (
      <button
        onClick={handleLoad}
        disabled={loading}
        className="w-full py-3 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-2xl hover:bg-blue-100 transition-colors"
      >
        {loading ? "Loading..." : "View Skill Gap"}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Skill Gap</h2>
      <p className="text-xs text-gray-600 italic mb-3">{gap.overallReadiness}</p>
      {gap.matchedSkills.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-green-700 mb-1.5">You Have</p>
          <div className="flex flex-wrap gap-1.5">
            {gap.matchedSkills.map((s) => (
              <span key={s} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      {gap.gapAnalysis.length > 0 && (
        <div>
          <p className="text-xs font-medium text-red-600 mb-1.5">Gaps</p>
          <div className="space-y-2">
            {gap.gapAnalysis.map((g) => (
              <div key={g.skill} className="text-xs bg-red-50 rounded-lg p-2.5">
                <p className="font-medium text-red-700">{g.skill}</p>
                <p className="text-gray-600 mt-0.5">{g.whyItMatters}</p>
                <p className="text-blue-600 mt-0.5">→ {g.howToLearn}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}