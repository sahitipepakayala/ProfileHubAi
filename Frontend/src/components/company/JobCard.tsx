import { Link } from "react-router-dom";
import type { Job } from "../../types";

interface JobCardProps {
  job: Job;
}

// Equivalent to the job row markup already inline in CompanyDashboard.tsx.
// Not currently used there — available if you want to extract it later.
export default function JobCard({ job }: JobCardProps) {
  const isAnalyzed = job.extractedSkills?.length > 0;

  return (
    <Link
      to={`/company/jobs/${job._id}`}
      className="block bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-blue-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-gray-900">
          {job.extractedRoles?.length > 0 ? job.extractedRoles.join(", ") : "Unanalyzed job"}
        </p>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            job.status === "open" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {job.status}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1 truncate">{job.rawDescription}</p>
      {isAnalyzed && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.extractedSkills.slice(0, 5).map((skill) => (
            <span key={skill} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
              {skill}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}