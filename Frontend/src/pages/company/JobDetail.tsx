// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import {
//   getJobById,
//   getHybridMatches,
//   generateInvitation,
//   getSkillGap,
//   getInterviewQuestions,
//   explainCandidateMatch,
//   getJobApplications,
//   updateApplicationStatus,
//   getJobDashboard,
// } from "../../api/jobsApi";
// import type {
//   Job,
//   Candidate,
//   CandidateMatch,
//   SkillGapResult,
//   InterviewQuestionsResult,
//   MatchExplanation,
//   Application,
//   ApplicationStatus,
//   JobDashboard,
// } from "../../types";
// import Loader from "../../components/common/Loader";

// type Tab = "matches" | "applications" | "dashboard";

// export default function JobDetail() {
//   const { id } = useParams<{ id: string }>();
//   const [job, setJob] = useState<Job | null>(null);
//   const [tab, setTab] = useState<Tab>("matches");
//   const [matches, setMatches] = useState<CandidateMatch[]>([]);
//   const [applications, setApplications] = useState<Application[]>([]);
//   const [dashboard, setDashboard] = useState<JobDashboard | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [matchLoading, setMatchLoading] = useState(false);
//   const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
//   const [skillGap, setSkillGap] = useState<SkillGapResult | null>(null);
//   const [questions, setQuestions] = useState<InterviewQuestionsResult | null>(null);
//   const [explanation, setExplanation] = useState<MatchExplanation | null>(null);
//   const [invitation, setInvitation] = useState<string | null>(null);
//   const [panelLoading, setPanelLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!id) return;
//     const fetchJob = async () => {
//       try {
//         const [jobData, appData, dashData] = await Promise.all([
//           getJobById(id),
//           getJobApplications(id),
//           getJobDashboard(id),
//         ]);
//         setJob(jobData);
//         setApplications(appData.applications);
//         setDashboard(dashData);
//       } catch {
//         setError("Failed to load job details.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchJob();
//   }, [id]);

//   const handleFindMatches = async () => {
//     if (!id) return;
//     setMatchLoading(true);
//     setError("");
//     try {
//       const result = await getHybridMatches(id);
//       setMatches(result.matches);
//     } catch {
//       setError("Failed to get matches.");
//     } finally {
//       setMatchLoading(false);
//     }
//   };

//   const handleSelectCandidate = async (candidateId: string) => {
//     if (!id) return;
//     setSelectedCandidate(candidateId);
//     setSkillGap(null);
//     setQuestions(null);
//     setExplanation(null);
//     setInvitation(null);
//     setPanelLoading(true);

//     try {
//       const [gapRes, explainRes] = await Promise.all([
//         getSkillGap(id, candidateId),
//         explainCandidateMatch(id, candidateId),
//       ]);
//       setSkillGap(gapRes.gapAnalysis);
//       setExplanation(explainRes.explanation);
//     } catch {
//       setError("Failed to load candidate details.");
//     } finally {
//       setPanelLoading(false);
//     }
//   };

//   const handleGenerateQuestions = async () => {
//     if (!id || !selectedCandidate) return;
//     setPanelLoading(true);
//     try {
//       const result = await getInterviewQuestions(id, selectedCandidate);
//       setQuestions(result.questions);
//     } catch {
//       setError("Failed to generate questions.");
//     } finally {
//       setPanelLoading(false);
//     }
//   };

//   const handleGenerateInvitation = async () => {
//     if (!id || !selectedCandidate) return;
//     setPanelLoading(true);
//     try {
//       const result = await generateInvitation(id, selectedCandidate);
//       setInvitation(result.invitation);
//     } catch {
//       setError("Failed to generate invitation.");
//     } finally {
//       setPanelLoading(false);
//     }
//   };

//   const handleStatusUpdate = async (
//     applicationId: string,
//     status: ApplicationStatus
//   ) => {
//     if (!id) return;
//     try {
//       await updateApplicationStatus(id, applicationId, status);
//       setApplications((prev) =>
//         prev.map((a) => (a._id === applicationId ? { ...a, status } : a))
//       );
//     } catch {
//       setError("Failed to update status.");
//     }
//   };

//   if (loading) return <Loader />;
//   if (!job) return <div className="p-8 text-center text-gray-400">Job not found.</div>;

//   const getCandidateId = (candidate: string | Candidate) =>
//     typeof candidate === "string" ? candidate : candidate._id;

//   const candidateDetailPanel = !selectedCandidate ? (
//     <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
//       <p className="text-gray-400 text-sm">
//         Select a candidate to view skill gap analysis, match explanation, and interview prep.
//       </p>
//     </div>
//   ) : panelLoading ? (
//     <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex items-center justify-center">
//       <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
//     </div>
//   ) : (
//     <div className="space-y-4">
//       {explanation && (
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//           <h3 className="text-sm font-semibold text-gray-900 mb-3">Why This Candidate?</h3>
//           <p className="text-sm text-gray-700 mb-3">{explanation.summary}</p>
//           {explanation.strengths.length > 0 && (
//             <div className="mb-3">
//               <p className="text-xs font-medium text-green-700 mb-1">Strengths</p>
//               <ul className="space-y-1">
//                 {explanation.strengths.map((s, i) => (
//                   <li key={i} className="text-xs text-gray-600 flex gap-2">
//                     <span className="text-green-500">✓</span> {s}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//           {explanation.considerations.length > 0 && (
//             <div>
//               <p className="text-xs font-medium text-amber-700 mb-1">Considerations</p>
//               <ul className="space-y-1">
//                 {explanation.considerations.map((c, i) => (
//                   <li key={i} className="text-xs text-gray-600 flex gap-2">
//                     <span className="text-amber-500">⚠</span> {c}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       )}

//       {skillGap && (
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//           <h3 className="text-sm font-semibold text-gray-900 mb-3">Skill Gap Analysis</h3>
//           <p className="text-xs text-gray-600 italic mb-3">{skillGap.overallReadiness}</p>
//           {skillGap.matchedSkills.length > 0 && (
//             <div className="mb-3">
//               <p className="text-xs font-medium text-green-700 mb-1.5">Matched Skills</p>
//               <div className="flex flex-wrap gap-1.5">
//                 {skillGap.matchedSkills.map((s) => (
//                   <span key={s} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
//                     {s}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}
//           {skillGap.missingSkills.length > 0 && (
//             <div>
//               <p className="text-xs font-medium text-red-600 mb-1.5">Gaps</p>
//               <div className="space-y-2">
//                 {skillGap.gapAnalysis.map((g) => (
//                   <div key={g.skill} className="text-xs bg-red-50 rounded-lg p-2.5">
//                     <p className="font-medium text-red-700">{g.skill}</p>
//                     <p className="text-gray-600 mt-0.5">{g.whyItMatters}</p>
//                     <p className="text-blue-600 mt-0.5">→ {g.howToLearn}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {questions ? (
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//           <h3 className="text-sm font-semibold text-gray-900 mb-3">Interview Questions</h3>
//           <div className="space-y-2 mb-4">
//             {questions.technicalQuestions.map((q, i) => (
//               <div key={i} className="text-xs bg-gray-50 rounded-lg p-2.5">
//                 <div className="flex items-center justify-between mb-0.5">
//                   <span className="font-medium text-gray-600">{q.skillTested}</span>
//                   <DifficultyBadge level={q.difficulty} />
//                 </div>
//                 <p className="text-gray-800">{q.question}</p>
//               </div>
//             ))}
//           </div>
//           <p className="text-xs text-blue-700 bg-blue-50 rounded-lg p-2.5">
//             💡 {questions.preparationTip}
//           </p>
//         </div>
//       ) : (
//         <button
//           onClick={handleGenerateQuestions}
//           disabled={panelLoading}
//           className="w-full py-3 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
//         >
//           Generate Interview Questions
//         </button>
//       )}

//       {invitation ? (
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//           <h3 className="text-sm font-semibold text-gray-900 mb-3">Draft Invitation</h3>
//           <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{invitation}</p>
//           <button
//             onClick={() => navigator.clipboard.writeText(invitation)}
//             className="mt-3 text-xs text-blue-600 hover:underline"
//           >
//             Copy to clipboard
//           </button>
//         </div>
//       ) : (
//         <button
//           onClick={handleGenerateInvitation}
//           disabled={panelLoading}
//           className="w-full py-3 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
//         >
//           Generate Interview Invitation
//         </button>
//       )}
//     </div>
//   );

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
//         <div className="flex items-start justify-between">
//           <div>
//             <h1 className="text-xl font-bold text-gray-900">
//               {job.extractedRoles?.join(", ") || "Unanalyzed Job"}
//             </h1>
//             <p className="text-sm text-gray-500 mt-1 max-w-xl">{job.rawDescription}</p>
//             <div className="flex flex-wrap gap-2 mt-3">
//               {job.extractedSkills?.map((skill) => (
//                 <span key={skill} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
//                   {skill}
//                 </span>
//               ))}
//             </div>
//           </div>
//           <span className={`text-xs px-3 py-1 rounded-full font-medium ${
//             job.status === "open" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
//           }`}>
//             {job.status}
//           </span>
//         </div>
//       </div>

//       {error && (
//         <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
//           {error}
//         </div>
//       )}

//       <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
//         {(["matches", "applications", "dashboard"] as Tab[]).map((t) => (
//           <button
//             key={t}
//             onClick={() => setTab(t)}
//             className={`px-4 py-2 text-sm font-medium rounded-md transition-all capitalize ${
//               tab === t ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             {t}
//           </button>
//         ))}
//       </div>

//       {tab === "matches" && (
//         <div className="flex gap-6">
//           <div className="w-80 flex-shrink-0">
//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//               <div className="p-4 border-b border-gray-100 flex items-center justify-between">
//                 <h2 className="text-sm font-semibold text-gray-900">Matched Candidates</h2>
//                 <button
//                   onClick={handleFindMatches}
//                   disabled={matchLoading}
//                   className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
//                 >
//                   {matchLoading ? "Finding..." : matches.length > 0 ? "Refresh" : "Find Matches"}
//                 </button>
//               </div>

//               {matches.length === 0 ? (
//                 <p className="text-xs text-gray-400 text-center py-8 px-4">
//                   Click "Find Matches" to run the AI pipeline and discover candidates.
//                 </p>
//               ) : (
//                 <div className="divide-y divide-gray-100">
//                   {matches.map((m) => (
//                     <button
//                       key={m._id}
//                       onClick={() => handleSelectCandidate(m._id)}
//                       className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
//                         selectedCandidate === m._id ? "bg-blue-50 border-l-2 border-blue-600" : ""
//                       }`}
//                     >
//                       <div className="flex items-center justify-between">
//                         <p className="text-sm font-medium text-gray-900">{m.fullName}</p>
//                         <MatchBadge score={m.matchPercentage} />
//                       </div>
//                       <p className="text-xs text-gray-500 mt-0.5">{m.email}</p>
//                       <div className="flex flex-wrap gap-1 mt-1.5">
//                         {m.skills?.slice(0, 3).map((s) => (
//                           <span key={s} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
//                             {s}
//                           </span>
//                         ))}
//                         {m.skills?.length > 3 && (
//                           <span className="text-xs text-gray-400">+{m.skills.length - 3}</span>
//                         )}
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="flex-1">
//             {candidateDetailPanel}
//           </div>
//         </div>
//       )}




// {/* APPLICATIONS TAB */}
// {tab === "applications" && (
//   <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//     <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
//       <h2 className="font-semibold text-gray-900">
//         Applicants ({applications.length})
//       </h2>
//     </div>
//     {applications.length === 0 ? (
//       <p className="text-sm text-gray-400 text-center py-12">
//         No applications yet.
//       </p>
//     ) : (
//       <div className="divide-y divide-gray-100">
//         {applications.map((app) => {
//           const candidate = app.candidate as any;
//           return (
//             <div key={app._id} className="px-6 py-5">
//               {/* Top row — name + status */}
//               <div className="flex items-start justify-between mb-3">
//                 <div>
//                   <p className="text-sm font-semibold text-gray-900">
//                     {candidate?.fullName ?? "Unknown"}
//                   </p>
//                   <p className="text-xs text-gray-500">{candidate?.email}</p>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   {app.matchScoreAtApply !== null && (
//                     <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
//                       (app.matchScoreAtApply ?? 0) >= 75
//                         ? "bg-green-50 text-green-700"
//                         : (app.matchScoreAtApply ?? 0) >= 50
//                         ? "bg-amber-50 text-amber-700"
//                         : "bg-red-50 text-red-600"
//                     }`}>
//                       {app.matchScoreAtApply}% match
//                     </span>
//                   )}
//                   <select
//                     value={app.status}
//                     onChange={(e) =>
//                       handleStatusUpdate(app._id, e.target.value as ApplicationStatus)
//                     }
//                     className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     {["applied", "shortlisted", "interview", "rejected", "hired"].map((s) => (
//                       <option key={s} value={s}>
//                         {s.charAt(0).toUpperCase() + s.slice(1)}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* Candidate details grid */}
//               <div className="grid grid-cols-2 gap-4 mb-3">
//                 <div>
//                   <p className="text-xs font-medium text-gray-500 mb-1">
//                     Experience
//                   </p>
//                   <p className="text-sm text-gray-800">
//                     {candidate?.experienceYears ?? 0}{" "}
//                     {candidate?.experienceYears === 1 ? "year" : "years"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs font-medium text-gray-500 mb-1">
//                     Career Goal
//                   </p>
//                   <p className="text-sm text-gray-800">
//                     {candidate?.careerGoal || "—"}
//                   </p>
//                 </div>
//               </div>

//               {/* Skills */}
//               {candidate?.skills?.length > 0 && (
//                 <div>
//                   <p className="text-xs font-medium text-gray-500 mb-1.5">
//                     Skills
//                   </p>
//                   <div className="flex flex-wrap gap-1.5">
//                     {candidate.skills.map((skill: string) => {
//                       // Highlight skills that match the job's extracted skills
//                       const isMatch = job?.extractedSkills?.some(
//                         (s) => s.toLowerCase() === skill.toLowerCase()
//                       );
//                       return (
//                         <span
//                           key={skill}
//                           className={`text-xs px-2 py-0.5 rounded-full font-medium ${
//                             isMatch
//                               ? "bg-green-50 text-green-700 border border-green-200"
//                               : "bg-gray-100 text-gray-600"
//                           }`}
//                         >
//                           {skill}
//                         </span>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {/* Quick action buttons */}
//               <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
//                 <button
//                   onClick={() => {
//                     setSelectedCandidate(candidate?._id);
//                     setTab("matches");
//                     handleSelectCandidate(candidate?._id);
//                   }}
//                   className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
//                 >
//                   View AI Analysis
//                 </button>
//                 <button
//                   onClick={async () => {
//                     if (!id || !candidate?._id) return;
//                     setPanelLoading(true);
//                     try {
//                       const result = await generateInvitation(id, candidate._id);
//                       setInvitation(result.invitation);
//                       setSelectedCandidate(candidate._id);
//                       setTab("matches");
//                     } catch {
//                       setError("Failed to generate invitation.");
//                     } finally {
//                       setPanelLoading(false);
//                     }
//                   }}
//                   className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
//                 >
//                   Generate Invitation
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     )}
//   </div>
// )}
//       {/* {tab === "applications" && (
//         <div className="flex gap-6">
//           <div className="w-96 flex-shrink-0">
//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//               <div className="px-6 py-4 border-b border-gray-100">
//                 <h2 className="font-semibold text-gray-900">Applicants ({applications.length})</h2>
//               </div>
//               {applications.length === 0 ? (
//                 <p className="text-sm text-gray-400 text-center py-12">No applications yet.</p>
//               ) : (
//                 <div className="divide-y divide-gray-100">
//                   {applications.map((app) => {
//                     const candidate =
//                       typeof app.candidate === "string" ? null : (app.candidate as Candidate);
//                     const candidateId = getCandidateId(app.candidate);
//                     const isSelected = selectedCandidate === candidateId;

//                     return (
//                       <div
//                         key={app._id}
//                         className={`px-4 py-4 transition-colors ${
//                           isSelected ? "bg-blue-50 border-l-2 border-blue-600" : "hover:bg-gray-50"
//                         }`}
//                       >
//                         <button
//                           type="button"
//                           onClick={() => handleSelectCandidate(candidateId)}
//                           className="w-full text-left"
//                         >
//                           <div className="flex items-start justify-between gap-2">
//                             <div className="flex-1 min-w-0">
//                               <p className="text-sm font-medium text-gray-900">
//                                 {candidate?.fullName ?? "Unknown"}
//                               </p>
//                               <p className="text-xs text-gray-500">{candidate?.email}</p>
//                             </div>
//                             {app.matchScoreAtApply !== null && (
//                               <MatchBadge score={app.matchScoreAtApply} />
//                             )}
//                           </div>

//                           {candidate && (
//                             <div className="mt-2 space-y-2">
//                               <p className="text-xs text-gray-600">
//                                 {candidate.experienceYears} year
//                                 {candidate.experienceYears !== 1 ? "s" : ""} experience
//                               </p>
//                               {candidate.careerGoal && (
//                                 <p className="text-xs text-gray-500 line-clamp-2">
//                                   Goal: {candidate.careerGoal}
//                                 </p>
//                               )}
//                               {candidate.skills?.length > 0 && (
//                                 <div className="flex flex-wrap gap-1">
//                                   {candidate.skills.slice(0, 6).map((skill) => (
//                                     <span
//                                       key={skill}
//                                       className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
//                                     >
//                                       {skill}
//                                     </span>
//                                   ))}
//                                   {candidate.skills.length > 6 && (
//                                     <span className="text-xs text-gray-400">
//                                       +{candidate.skills.length - 6} more
//                                     </span>
//                                   )}
//                                 </div>
//                               )}
//                               {candidate.strengths?.length > 0 && (
//                                 <p className="text-xs text-gray-500">
//                                   Strengths: {candidate.strengths.slice(0, 3).join(", ")}
//                                 </p>
//                               )}
//                               {candidate.projects?.length > 0 && (
//                                 <p className="text-xs text-gray-500">
//                                   Projects: {candidate.projects.map((p) => p.title).join(", ")}
//                                 </p>
//                               )}
//                             </div>
//                           )}
//                         </button>

//                         <div className="mt-3 flex justify-end">
//                           <select
//                             value={app.status}
//                             onChange={(e) =>
//                               handleStatusUpdate(app._id, e.target.value as ApplicationStatus)
//                             }
//                             onClick={(e) => e.stopPropagation()}
//                             className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           >
//                             {["applied", "shortlisted", "interview", "rejected", "hired"].map((s) => (
//                               <option key={s} value={s}>
//                                 {s.charAt(0).toUpperCase() + s.slice(1)}
//                               </option>
//                             ))}
//                           </select>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="flex-1">{candidateDetailPanel}</div>
//         </div>
//       )} */}

//       {tab === "dashboard" && dashboard && (
//         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//           {Object.entries(dashboard.funnel).map(([stage, count]) => (
//             <div key={stage} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//               <p className="text-2xl font-bold text-gray-900">{count}</p>
//               <p className="text-sm text-gray-500 mt-1 capitalize">{stage}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function MatchBadge({ score }: { score: number }) {
//   const color =
//     score >= 80 ? "bg-green-50 text-green-700" :
//     score >= 60 ? "bg-amber-50 text-amber-700" :
//     "bg-red-50 text-red-600";
//   return (
//     <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
//       {score}%
//     </span>
//   );
// }

// function DifficultyBadge({ level }: { level: string }) {
//   const color =
//     level === "advanced" ? "text-red-600 bg-red-50" :
//     level === "intermediate" ? "text-amber-600 bg-amber-50" :
//     "text-green-600 bg-green-50";
//   return (
//     <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${color}`}>
//       {level}
//     </span>
//   );
// }





import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getJobById,
  getHybridMatches,
  generateInvitation,
  getSkillGap,
  getInterviewQuestions,
  explainCandidateMatch,
  getJobApplications,
  updateApplicationStatus,
  getJobDashboard,
  updateJobSkills,
  sendJobMessage,
  getJobMessages,
  scheduleInterview,
  getJobInterviews,
} from "../../api/jobsApi";
import type {
  Job,
  Candidate,
  HybridCandidateMatch,
  SkillGapResult,
  InterviewQuestionsResult,
  MatchExplanation,
  Application,
  ApplicationStatus,
  JobDashboard,
  Message,
  Interview,
} from "../../types";
import Loader from "../../components/common/Loader";

type Tab = "matches" | "applications" | "interviews" | "messages" | "dashboard";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [tab, setTab] = useState<Tab>("matches");
  const [matches, setMatches] = useState<HybridCandidateMatch[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [dashboard, setDashboard] = useState<JobDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGapResult | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestionsResult | null>(null);
  const [explanation, setExplanation] = useState<MatchExplanation | null>(null);
  const [invitation, setInvitation] = useState<string | null>(null);
  const [invitationSent, setInvitationSent] = useState(false);
  const [panelLoading, setPanelLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Skills editing
  const [editingSkills, setEditingSkills] = useState(false);
  const [skillDraft, setSkillDraft] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [savingSkills, setSavingSkills] = useState(false);

  // Interviews
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [schedulingFor, setSchedulingFor] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    scheduledAt: "",
    mode: "video" as "video" | "phone" | "onsite",
    meetingDetails: "",
    notes: "",
  });
  const [scheduling, setScheduling] = useState(false);

  // Messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageCandidate, setMessageCandidate] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      try {
        const [jobData, appData, dashData, interviewData, msgData] = await Promise.all([
          getJobById(id),
          getJobApplications(id),
          getJobDashboard(id),
          getJobInterviews(id).catch(() => ({ interviews: [] })),
          getJobMessages(id).catch(() => ({ messages: [] })),
        ]);
        setJob(jobData);
        setSkillDraft(jobData.extractedSkills || []);
        setApplications(appData.applications);
        setDashboard(dashData);
        setInterviews(interviewData.interviews);
        setMessages(msgData.messages);
      } catch {
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleFindMatches = async () => {
    if (!id) return;
    setMatchLoading(true);
    setError("");
    try {
      const result = await getHybridMatches(id);
      setMatches(result.matches);
    } catch {
      setError("Failed to get matches.");
    } finally {
      setMatchLoading(false);
    }
  };

  const handleSelectCandidate = async (candidateId: string) => {
    if (!id) return;
    setSelectedCandidate(candidateId);
    setSkillGap(null);
    setQuestions(null);
    setExplanation(null);
    setInvitation(null);
    setPanelLoading(true);

    try {
      const [gapRes, explainRes] = await Promise.all([
        getSkillGap(id, candidateId),
        explainCandidateMatch(id, candidateId),
      ]);
      setSkillGap(gapRes.gapAnalysis);
      setExplanation(explainRes.explanation);
    } catch {
      setError("Failed to load candidate details.");
    } finally {
      setPanelLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!id || !selectedCandidate) return;
    setPanelLoading(true);
    try {
      const result = await getInterviewQuestions(id, selectedCandidate);
      setQuestions(result.questions);
    } catch {
      setError("Failed to generate questions.");
    } finally {
      setPanelLoading(false);
    }
  };

  const handleGenerateInvitation = async () => {
    if (!id || !selectedCandidate) return;
    setPanelLoading(true);
    setInvitationSent(false);
    try {
      const result = await generateInvitation(id, selectedCandidate);
      setInvitation(result.invitation);
    } catch {
      setError("Failed to generate invitation.");
    } finally {
      setPanelLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!id || !selectedCandidate || !invitation) return;
    setPanelLoading(true);
    setError("");
    try {
      await sendJobMessage(id, {
        candidateId: selectedCandidate,
        content: invitation,
        type: "invitation",
      });
      setInvitationSent(true);
      setSuccess("Invitation sent to candidate successfully.");
    } catch {
      setError("Failed to send invitation.");
    } finally {
      setPanelLoading(false);
    }
  };

  const handleSaveSkills = async () => {
    if (!id) return;
    setSavingSkills(true);
    setError("");
    try {
      const result = await updateJobSkills(id, skillDraft);
      setJob(result.job);
      setEditingSkills(false);
      setSuccess("Skills updated successfully.");
    } catch {
      setError("Failed to update skills.");
    } finally {
      setSavingSkills(false);
    }
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skillDraft.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillDraft((prev) => [...prev, trimmed]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillDraft((prev) => prev.filter((s) => s !== skill));
  };

  const handleScheduleInterview = async (applicationId: string) => {
    if (!id || !scheduleForm.scheduledAt) return;
    setScheduling(true);
    setError("");
    try {
      const result = await scheduleInterview(id, applicationId, {
        scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
        mode: scheduleForm.mode,
        meetingDetails: scheduleForm.meetingDetails,
        notes: scheduleForm.notes,
      });
      setInterviews((prev) => [...prev, result.interview]);
      setApplications((prev) =>
        prev.map((a) => (a._id === applicationId ? { ...a, status: "interview" as ApplicationStatus } : a))
      );
      setSchedulingFor(null);
      setScheduleForm({ scheduledAt: "", mode: "video", meetingDetails: "", notes: "" });
      setSuccess("Interview scheduled. Candidate can now confirm or decline.");
    } catch {
      setError("Failed to schedule interview.");
    } finally {
      setScheduling(false);
    }
  };

  const handleLoadConversation = async (candidateId: string) => {
    if (!id) return;
    setMessageCandidate(candidateId);
    try {
      const res = await getJobMessages(id, candidateId);
      setConversation(res.messages);
    } catch {
      setError("Failed to load conversation.");
    }
  };

  const handleSendMessage = async () => {
    if (!id || !messageCandidate || !newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const res = await sendJobMessage(id, {
        candidateId: messageCandidate,
        content: newMessage.trim(),
      });
      setConversation((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch {
      setError("Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStatusUpdate = async (
    applicationId: string,
    status: ApplicationStatus
  ) => {
    if (!id) return;
    try {
      await updateApplicationStatus(id, applicationId, status);
      setApplications((prev) =>
        prev.map((a) => (a._id === applicationId ? { ...a, status } : a))
      );
    } catch {
      setError("Failed to update status.");
    }
  };

  if (loading) return <Loader />;
  if (!job) return <div className="p-8 text-center text-gray-400">Job not found.</div>;

  const getCandidateId = (candidate: string | Candidate) =>
    typeof candidate === "string" ? candidate : candidate._id;

  const candidateDetailPanel = !selectedCandidate ? (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
      <p className="text-gray-400 text-sm">
        Select a candidate to view skill gap analysis, match explanation, and interview prep.
      </p>
    </div>
  ) : panelLoading ? (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  ) : (
    <div className="space-y-4">
      {explanation && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Why This Candidate?</h3>
          <p className="text-sm text-gray-700 mb-3">{explanation.summary}</p>
          {explanation.strengths.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-green-700 mb-1">Strengths</p>
              <ul className="space-y-1">
                {explanation.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2">
                    <span className="text-green-500">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {explanation.considerations.length > 0 && (
            <div>
              <p className="text-xs font-medium text-amber-700 mb-1">Considerations</p>
              <ul className="space-y-1">
                {explanation.considerations.map((c, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2">
                    <span className="text-amber-500">⚠</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {skillGap && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Skill Gap Analysis</h3>
          <p className="text-xs text-gray-600 italic mb-3">{skillGap.overallReadiness}</p>
          {skillGap.matchedSkills.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-green-700 mb-1.5">Matched Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {skillGap.matchedSkills.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {skillGap.missingSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-600 mb-1.5">Gaps</p>
              <div className="space-y-2">
                {skillGap.gapAnalysis.map((g) => (
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
      )}

      {questions ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Interview Questions</h3>
          <div className="space-y-2 mb-4">
            {questions.technicalQuestions.map((q, i) => (
              <div key={i} className="text-xs bg-gray-50 rounded-lg p-2.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium text-gray-600">{q.skillTested}</span>
                  <DifficultyBadge level={q.difficulty} />
                </div>
                <p className="text-gray-800">{q.question}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700 bg-blue-50 rounded-lg p-2.5">
            💡 {questions.preparationTip}
          </p>
        </div>
      ) : (
        <button
          onClick={handleGenerateQuestions}
          disabled={panelLoading}
          className="w-full py-3 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
        >
          Generate Interview Questions
        </button>
      )}

      {invitation ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Draft Invitation</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{invitation}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigator.clipboard.writeText(invitation)}
              className="text-xs px-3 py-1.5 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              Copy to clipboard
            </button>
            {!invitationSent ? (
              <button
                onClick={handleSendInvitation}
                disabled={panelLoading}
                className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {panelLoading ? "Sending..." : "Send to Candidate"}
              </button>
            ) : (
              <span className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg">
                Sent ✓
              </span>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={handleGenerateInvitation}
          disabled={panelLoading}
          className="w-full py-3 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
        >
          Generate Interview Invitation
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {job.extractedRoles?.join(", ") || "Unanalyzed Job"}
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">{job.rawDescription}</p>
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-medium text-gray-500">Required Skills</p>
                {!editingSkills ? (
                  <button
                    onClick={() => { setEditingSkills(true); setSkillDraft(job.extractedSkills || []); }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSkills}
                      disabled={savingSkills}
                      className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {savingSkills ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => { setEditingSkills(false); setSkillDraft(job.extractedSkills || []); }}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              {editingSkills ? (
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skillDraft.map((skill) => (
                      <span key={skill} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full flex items-center gap-1">
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} className="text-blue-400 hover:text-red-500 ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                      placeholder="Add a skill..."
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleAddSkill} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {job.extractedSkills?.map((skill) => (
                    <span key={skill} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                      {skill}
                    </span>
                  ))}
                  {(!job.extractedSkills || job.extractedSkills.length === 0) && (
                    <span className="text-xs text-gray-400">No skills yet — analyze the job or add manually</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            job.status === "open" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
          }`}>
            {job.status}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
          {success}
          <button onClick={() => setSuccess("")} className="ml-2 text-green-500 hover:underline text-xs">dismiss</button>
        </div>
      )}

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {(["matches", "applications", "interviews", "messages", "dashboard"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all capitalize ${
              tab === t ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "matches" && (
        <div className="flex gap-6">
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Matched Candidates</h2>
                <button
                  onClick={handleFindMatches}
                  disabled={matchLoading}
                  className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {matchLoading ? "Finding..." : matches.length > 0 ? "Refresh" : "Find Matches"}
                </button>
              </div>

              {matches.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8 px-4">
                  Click "Find Matches" to run the AI pipeline and discover candidates.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {matches.map((m) => (
                    <button
                      key={m.candidateId}
                      onClick={() => handleSelectCandidate(m.candidateId)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        selectedCandidate === m.candidateId ? "bg-blue-50 border-l-2 border-blue-600" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{m.fullName}</p>
                        <MatchBadge score={m.hybridScore} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{m.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {m.matchedSkills?.slice(0, 3).map((s) => (
                          <span key={s} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {s}
                          </span>
                        ))}
                        {m.matchedSkills?.length > 3 && (
                          <span className="text-xs text-gray-400">+{m.matchedSkills.length - 3}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            {candidateDetailPanel}
          </div>
        </div>
      )}




{/* APPLICATIONS TAB */}
{tab === "applications" && (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
      <h2 className="font-semibold text-gray-900">
        Applicants ({applications.length})
      </h2>
    </div>
    {applications.length === 0 ? (
      <p className="text-sm text-gray-400 text-center py-12">
        No applications yet.
      </p>
    ) : (
      <div className="divide-y divide-gray-100">
        {applications.map((app) => {
          const candidate = app.candidate as any;
          return (
            <div key={app._id} className="px-6 py-5">
              {/* Top row — name + status */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {candidate?.fullName ?? "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">{candidate?.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {app.matchScoreAtApply !== null && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      (app.matchScoreAtApply ?? 0) >= 75
                        ? "bg-green-50 text-green-700"
                        : (app.matchScoreAtApply ?? 0) >= 50
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-600"
                    }`}>
                      {app.matchScoreAtApply}% match
                    </span>
                  )}
                  <select
                    value={app.status}
                    onChange={(e) =>
                      handleStatusUpdate(app._id, e.target.value as ApplicationStatus)
                    }
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {["applied", "shortlisted", "interview", "rejected", "hired"].map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Candidate details grid */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Experience
                  </p>
                  <p className="text-sm text-gray-800">
                    {candidate?.experienceYears ?? 0}{" "}
                    {candidate?.experienceYears === 1 ? "year" : "years"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Career Goal
                  </p>
                  <p className="text-sm text-gray-800">
                    {candidate?.careerGoal || "—"}
                  </p>
                </div>
              </div>

              {/* Skills */}
              {candidate?.skills?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((skill: string) => {
                      // Highlight skills that match the job's extracted skills
                      const isMatch = job?.extractedSkills?.some(
                        (s) => s.toLowerCase() === skill.toLowerCase()
                      );
                      return (
                        <span
                          key={skill}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isMatch
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick action buttons */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50 flex-wrap">
                <button
                  onClick={() => {
                    setSelectedCandidate(candidate?._id);
                    setTab("matches");
                    handleSelectCandidate(candidate?._id);
                  }}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  View AI Analysis
                </button>
                <button
                  onClick={async () => {
                    if (!id || !candidate?._id) return;
                    setPanelLoading(true);
                    try {
                      const result = await generateInvitation(id, candidate._id);
                      setInvitation(result.invitation);
                      setSelectedCandidate(candidate._id);
                      setTab("matches");
                    } catch {
                      setError("Failed to generate invitation.");
                    } finally {
                      setPanelLoading(false);
                    }
                  }}
                  className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Generate Invitation
                </button>
                <button
                  onClick={() => {
                    setSchedulingFor(schedulingFor === app._id ? null : app._id);
                    setScheduleForm({ scheduledAt: "", mode: "video", meetingDetails: "", notes: "" });
                  }}
                  className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  Schedule Interview
                </button>
                <button
                  onClick={() => {
                    setTab("messages");
                    handleLoadConversation(candidate?._id);
                  }}
                  className="text-xs px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Message
                </button>
              </div>

              {/* Schedule Interview Form */}
              {schedulingFor === app._id && (
                <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <h4 className="text-sm font-semibold text-purple-900 mb-3">Schedule Interview</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Date & Time</label>
                      <input
                        type="datetime-local"
                        value={scheduleForm.scheduledAt}
                        onChange={(e) => setScheduleForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Mode</label>
                      <select
                        value={scheduleForm.mode}
                        onChange={(e) => setScheduleForm((f) => ({ ...f, mode: e.target.value as "video" | "phone" | "onsite" }))}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="video">Video</option>
                        <option value="phone">Phone</option>
                        <option value="onsite">On-site</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-xs text-gray-600 block mb-1">Meeting Details (link, phone, or address)</label>
                    <input
                      type="text"
                      value={scheduleForm.meetingDetails}
                      onChange={(e) => setScheduleForm((f) => ({ ...f, meetingDetails: e.target.value }))}
                      placeholder="e.g. https://meet.google.com/abc-defg-hij"
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="text-xs text-gray-600 block mb-1">Notes (optional)</label>
                    <textarea
                      value={scheduleForm.notes}
                      onChange={(e) => setScheduleForm((f) => ({ ...f, notes: e.target.value }))}
                      rows={2}
                      placeholder="Any additional details for the candidate..."
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleScheduleInterview(app._id)}
                      disabled={scheduling || !scheduleForm.scheduledAt}
                      className="text-xs px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {scheduling ? "Scheduling..." : "Confirm Schedule"}
                    </button>
                    <button
                      onClick={() => setSchedulingFor(null)}
                      className="text-xs px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
)}

      {tab === "interviews" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Scheduled Interviews ({interviews.length})</h2>
          </div>
          {interviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">
              No interviews scheduled yet. Use the Applications tab to schedule one.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {interviews.map((interview) => {
                const candidate = typeof interview.candidate === "object" ? interview.candidate : null;
                return (
                  <div key={interview._id} className="px-6 py-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {candidate?.fullName || "Candidate"}
                      </p>
                      <p className="text-xs text-gray-500">{candidate?.email}</p>
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(interview.scheduledAt).toLocaleString()} ·{" "}
                        <span className="capitalize">{interview.mode}</span>
                      </p>
                      {interview.meetingDetails && (
                        <p className="text-xs text-blue-600 mt-1">{interview.meetingDetails}</p>
                      )}
                      {interview.notes && (
                        <p className="text-xs text-gray-500 mt-1 italic">{interview.notes}</p>
                      )}
                    </div>
                    <InterviewStatusBadge status={interview.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "messages" && (
        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
              </div>
              {messages.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8 px-4">
                  No messages yet. Send an invitation or message from the Applications tab.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {Array.from(new Set(messages.map((m) => {
                    const c = typeof m.candidate === "object" ? m.candidate._id : m.candidate;
                    return c;
                  }))).map((candidateId) => {
                    const candidateMsg = messages.find((m) => {
                      const c = typeof m.candidate === "object" ? m.candidate._id : m.candidate;
                      return c === candidateId;
                    });
                    const candidate = candidateMsg && typeof candidateMsg.candidate === "object"
                      ? candidateMsg.candidate : null;
                    return (
                      <button
                        key={candidateId}
                        onClick={() => handleLoadConversation(candidateId)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                          messageCandidate === candidateId ? "bg-blue-50 border-l-2 border-blue-600" : ""
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900">{candidate?.fullName || "Candidate"}</p>
                        <p className="text-xs text-gray-500 truncate">{candidate?.email}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
            {!messageCandidate ? (
              <div className="flex-1 flex items-center justify-center p-12">
                <p className="text-sm text-gray-400">Select a conversation to view messages</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
                  {conversation.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.senderRole === "company" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-xl text-sm ${
                          msg.senderRole === "company"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        } ${msg.type === "invitation" ? "border-2 border-green-300" : ""}`}
                      >
                        {msg.type === "invitation" && (
                          <p className="text-xs font-semibold mb-1 opacity-75">Interview Invitation</p>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.senderRole === "company" ? "text-blue-200" : "text-gray-400"}`}>
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "dashboard" && dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(dashboard.funnel).map(([stage, count]) => (
            <div key={stage} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-500 mt-1 capitalize">{stage}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-50 text-green-700" :
    score >= 60 ? "bg-amber-50 text-amber-700" :
    "bg-red-50 text-red-600";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {score}%
    </span>
  );
}

function DifficultyBadge({ level }: { level: string }) {
  const color =
    level === "advanced" ? "text-red-600 bg-red-50" :
    level === "intermediate" ? "text-amber-600 bg-amber-50" :
    "text-green-600 bg-green-50";
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${color}`}>
      {level}
    </span>
  );
}

function InterviewStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    proposed: "bg-amber-50 text-amber-700",
    confirmed: "bg-green-50 text-green-700",
    declined: "bg-red-50 text-red-600",
    completed: "bg-blue-50 text-blue-700",
    cancelled: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
