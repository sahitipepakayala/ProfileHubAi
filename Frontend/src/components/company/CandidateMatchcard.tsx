import type {
  KeywordCandidateMatch,
  SemanticCandidateMatch,
  HybridCandidateMatch,
} from "../../types";

type MatchVariant =
  | { kind: "keyword"; match: KeywordCandidateMatch }
  | { kind: "semantic"; match: SemanticCandidateMatch }
  | { kind: "hybrid"; match: HybridCandidateMatch };

interface CandidateMatchCardProps {
  variant: MatchVariant;
  onSelect?: (candidateId: string) => void;
  selected?: boolean;
}

// Handles all three matching pipelines' different response shapes.
// Not currently used anywhere — JobDetail.tsx renders hybrid matches inline
// instead — but available if you add keyword/semantic tabs later, since
// your API layer already supports all three (see jobsApi.ts).
const normalize = (variant: MatchVariant) => {
  switch (variant.kind) {
    case "keyword":
      return {
        candidateId: variant.match.candidateId,
        fullName: variant.match.fullName,
        email: variant.match.email,
        score: variant.match.matchScore,
        skills: variant.match.matchedSkills,
      };
    case "semantic":
      return {
        candidateId: variant.match._id,
        fullName: variant.match.fullName,
        email: variant.match.email,
        score: variant.match.matchPercentage,
        skills: variant.match.skills,
      };
    case "hybrid":
      return {
        candidateId: variant.match.candidateId,
        fullName: variant.match.fullName,
        email: variant.match.email,
        score: variant.match.hybridScore,
        skills: variant.match.matchedSkills,
      };
  }
};

export default function CandidateMatchCard({ variant, onSelect, selected }: CandidateMatchCardProps) {
  const m = normalize(variant);
  const color =
    m.score >= 80 ? "bg-green-50 text-green-700" : m.score >= 60 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600";

  return (
    <button
      onClick={() => onSelect?.(m.candidateId)}
      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
        selected ? "bg-blue-50 border-l-2 border-blue-600" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">{m.fullName}</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{m.score}%</span>
      </div>
      <p className="text-xs text-gray-500 mt-0.5">{m.email}</p>
      <div className="flex flex-wrap gap-1 mt-1.5">
        {m.skills?.slice(0, 3).map((s) => (
          <span key={s} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
            {s}
          </span>
        ))}
        {m.skills?.length > 3 && <span className="text-xs text-gray-400">+{m.skills.length - 3}</span>}
      </div>
    </button>
  );
}