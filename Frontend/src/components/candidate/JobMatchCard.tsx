import { Link } from "react-router-dom";
import type { JobMatch } from "../../types";

interface JobMatchCardProps {
  job: JobMatch;
}

// Equivalent to the job row markup already inline in CandidateDashboard.tsx's
// matches tab. Not currently used there — available if you want to extract
// it later.
export default function JobMatchCard({ job }: JobMatchCardProps) {
  const color =
    job.matchPercentage >= 80
      ? "bg-green-50 text-green-700"
      : job.matchPercentage >= 60
      ? "bg-amber-50 text-amber-700"
      : "bg-red-50 text-red-600";

  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {job.extractedRoles?.length > 0 ? job.extractedRoles.join(", ") : "Open Role"}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {job.companyDetails?.companyName}
          {job.companyDetails?.industry ? ` · ${job.companyDetails.industry}` : ""}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {job.extractedSkills?.slice(0, 4).map((skill) => (
            <span key={skill} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{job.matchPercentage}%</span>
        <Link
          to={`/candidate/jobs/${job._id}`}
          className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}