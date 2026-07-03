import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJob, analyzeJob } from "../../api/jobsApi";

export default function PostJob() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setError("");
    setLoading(true);

    try {
      // Step 1: Create the job
      const { job } = await createJob(description);

      // Step 2: Immediately analyze it (extract skills + generate embedding)
      await analyzeJob(job._id);

      // Step 3: Navigate to the job detail page
      navigate(`/company/jobs/${job._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    "I need a React Developer with at least 2 years of experience.",
    "Looking for a Backend Developer skilled in Node.js and MongoDB.",
    "We need an AI/ML Engineer with experience in Python and LangChain.",
    "Hiring a Full Stack Developer with React, Node.js, and TypeScript.",
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-500 text-sm mt-1">
          Describe what you're looking for in plain English. Our AI will extract
          the skills and find the best candidates automatically.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your hiring requirement
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. I need a React Developer with experience in TypeScript and at least 1 year of work experience..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Be as specific or as general as you like. The AI will extract roles,
              skills, and experience requirements automatically.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Posting & analyzing...
              </span>
            ) : (
              "Post Job & Find Candidates"
            )}
          </button>
        </form>

        {/* Example descriptions */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-3">
            Try an example:
          </p>
          <div className="space-y-2">
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setDescription(ex)}
                className="w-full text-left text-xs text-gray-600 px-3 py-2 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}