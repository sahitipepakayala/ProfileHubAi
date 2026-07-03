import type { Candidate } from "../../types";

interface CandidateCardProps {
  candidate: Pick<Candidate, "fullName" | "email" | "skills" | "experienceYears" | "careerGoal">;
}

// Compact candidate summary block. Not currently used anywhere — your
// applications tab in JobDetail.tsx renders this inline instead — but
// available if you want to de-duplicate that markup later.
export default function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-900">{candidate.fullName}</p>
      <p className="text-xs text-gray-500">{candidate.email}</p>
      <p className="text-xs text-gray-600 mt-1">
        {candidate.experienceYears} {candidate.experienceYears === 1 ? "year" : "years"} experience
      </p>
      {candidate.careerGoal && (
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">Goal: {candidate.careerGoal}</p>
      )}
      {candidate.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {candidate.skills.slice(0, 6).map((skill) => (
            <span key={skill} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
              {skill}
            </span>
          ))}
          {candidate.skills.length > 6 && (
            <span className="text-xs text-gray-400">+{candidate.skills.length - 6} more</span>
          )}
        </div>
      )}
    </div>
  );
}