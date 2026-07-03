import { useState } from "react";

interface JobFormProps {
  onSubmit: (rawDescription: string) => Promise<void>;
  submitting?: boolean;
}

// Equivalent to the form markup already inline in PostJob.tsx.
// Not currently used there — available if you want to extract it later.
export default function JobForm({ onSubmit, submitting }: JobFormProps) {
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    await onSubmit(description.trim());
  };

  return (
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
          placeholder="e.g. I need a React Developer with experience in TypeScript..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !description.trim()}
        className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "Posting..." : "Post Job & Find Candidates"}
      </button>
    </form>
  );
}