import type { Interview, Candidate } from "../../types";

interface InterviewCardProps {
  interview: Interview;
}

const STATUS_COLORS: Record<string, string> = {
  proposed: "bg-amber-50 text-amber-700",
  confirmed: "bg-green-50 text-green-700",
  declined: "bg-red-50 text-red-600",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-gray-100 text-gray-600",
};

// No page currently renders a company-side interview list — JobDetail.tsx's
// Tab type only covers "matches" | "applications" | "dashboard" — so this is
// available if you add an Interviews tab later. Your backend already has the
// GET /jobs/:id/interviews endpoint ready (just needs wiring into jobsApi.ts).
export default function InterviewCard({ interview }: InterviewCardProps) {
  const candidate = typeof interview.candidate === "string" ? null : (interview.candidate as Candidate);

  return (
    <div className="px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-900">{candidate?.fullName ?? "Candidate"}</p>
          <p className="text-xs text-gray-600 mt-1">
            {new Date(interview.scheduledAt).toLocaleString()} · <span className="capitalize">{interview.mode}</span>
          </p>
          {interview.meetingDetails && <p className="text-xs text-blue-600 mt-1">{interview.meetingDetails}</p>}
          {interview.notes && <p className="text-xs text-gray-500 mt-1 italic">{interview.notes}</p>}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[interview.status]}`}>
          {interview.status}
        </span>
      </div>
    </div>
  );
}