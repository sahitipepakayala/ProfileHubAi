import { useState } from "react";
import { getInterviewQuestions } from "../../api/jobsApi";
import { useAuth } from "../../context/AuthContext";
import type { InterviewQuestionsResult } from "../../types";

interface InterviewPrepPanelProps {
  jobId: string;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  advanced: "text-red-600 bg-red-50",
  intermediate: "text-amber-600 bg-amber-50",
  beginner: "text-green-600 bg-green-50",
};

// Simplified alternative to the version inline in JobMatchDetail.tsx, which
// dynamically imports candidateApi just to get the candidate's own id — that
// id is already available from AuthContext directly. Not currently used —
// available as a more direct alternative.
export default function InterviewPrepPanel({ jobId }: InterviewPrepPanelProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<InterviewQuestionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoad = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await getInterviewQuestions(jobId, user.id);
      setQuestions(res.questions);
    } catch {
      setError("Failed to generate interview questions.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>;
  }

  if (!questions) {
    return (
      <button
        onClick={handleLoad}
        disabled={loading}
        className="w-full py-3 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-2xl hover:bg-purple-100 transition-colors"
      >
        {loading ? "Generating..." : "Generate Interview Questions"}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Interview Prep</h2>
      <div className="space-y-2 mb-4">
        {questions.technicalQuestions.map((q, i) => (
          <div key={i} className="text-xs bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between mb-1">
              <span className="font-medium text-gray-600">{q.skillTested}</span>
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${DIFFICULTY_COLOR[q.difficulty]}`}>
                {q.difficulty}
              </span>
            </div>
            <p className="text-gray-800">{q.question}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-blue-700 bg-blue-50 rounded-lg p-2.5">💡 {questions.preparationTip}</p>
    </div>
  );
}