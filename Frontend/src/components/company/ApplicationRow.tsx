import type { Application, ApplicationStatus, Candidate } from "../../types";
import CandidateCard from "./CandidateCard";

interface ApplicationRowProps {
  application: Application;
  onStatusChange: (applicationId: string, status: ApplicationStatus) => void;
}

const STATUS_OPTIONS: ApplicationStatus[] = ["applied", "shortlisted", "interview", "rejected", "hired"];

// Equivalent to the applicant row markup already inline in JobDetail.tsx's
// Applications tab. Not currently used there — available if you want to
// extract it later.
export default function ApplicationRow({ application, onStatusChange }: ApplicationRowProps) {
  const candidate = typeof application.candidate === "string" ? null : (application.candidate as Candidate);

  return (
    <div className="px-6 py-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        {candidate ? <CandidateCard candidate={candidate} /> : <p className="text-sm text-gray-400">Unknown candidate</p>}
        <div className="flex items-center gap-3 flex-shrink-0">
          {application.matchScoreAtApply !== null && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                application.matchScoreAtApply >= 75
                  ? "bg-green-50 text-green-700"
                  : application.matchScoreAtApply >= 50
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {application.matchScoreAtApply}% match
            </span>
          )}
          <select
            value={application.status}
            onChange={(e) => onStatusChange(application._id, e.target.value as ApplicationStatus)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}