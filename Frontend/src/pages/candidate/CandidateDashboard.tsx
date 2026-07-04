// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { getJobMatches, getMyApplications } from "../../api/candidateApi";
// import { JobMatch, Application } from "../../types";
// import Loader from "../../components/common/Loader";
// import { withdrawApplication } from "../../api/candidateApi";
// export default function CandidateDashboard() {
//   const [matches, setMatches] = useState<JobMatch[]>([]);
//   const [applications, setApplications] = useState<Application[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [tab, setTab] = useState<"matches" | "applications">("matches");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [matchRes, appRes] = await Promise.all([
//           getJobMatches().catch(() => ({ matches: [] })),
//           getMyApplications().catch(() => ({ applications: [] })),
//         ]);
//         setMatches(matchRes.matches ?? []);
//         setApplications(appRes.applications ?? []);
//       } catch {
//         setError("Failed to load dashboard.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   if (loading) return <Loader />;

//   return (
//     <div className="max-w-5xl mx-auto px-4 py-8">
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
//           <p className="text-gray-500 text-sm mt-1">
//             Jobs matched to your skills and your application statuses
//           </p>
//         </div>
//         <Link
//           to="/candidate/profile"
//           className="text-sm font-medium text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
//         >
//           Update Profile
//         </Link>
//       </div>

//       {error && (
//         <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
//           {error}
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
//         {(["matches", "applications"] as const).map((t) => (
//           <button
//             key={t}
//             onClick={() => setTab(t)}
//             className={`px-4 py-2 text-sm font-medium rounded-md transition-all capitalize ${
//               tab === t ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             {t} {t === "matches" ? `(${matches.length})` : `(${applications.length})`}
//           </button>
//         ))}
//       </div>

//       {/* Job matches */}
//       {tab === "matches" && (
//         <div>
//           {matches.length === 0 ? (
//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
//               <p className="text-gray-400 text-sm mb-3">
//                 No job matches yet. Upload your resume or add skills to your profile first.
//               </p>
//               <Link
//                 to="/candidate/profile"
//                 className="text-blue-600 text-sm font-medium hover:underline"
//               >
//                 Set up your profile →
//               </Link>
//             </div>
//           ) : (
//             <div className="grid gap-4">
//               {matches.map((match) => (
//                 <div
//                   key={match._id}
//                   className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-blue-300 transition-colors"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2 mb-1">
//                         <h3 className="text-sm font-semibold text-gray-900">
//                           {match.extractedRoles?.join(", ") || "Role"}
//                         </h3>
//                         <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
//                           match.matchPercentage >= 80
//                             ? "bg-green-50 text-green-700"
//                             : match.matchPercentage >= 60
//                             ? "bg-amber-50 text-amber-700"
//                             : "bg-red-50 text-red-600"
//                         }`}>
//                           {match.matchPercentage}% match
//                         </span>
//                       </div>
//                       <p className="text-xs text-gray-500 mb-2">
//                         {match.companyDetails?.companyName}
//                         {match.companyDetails?.industry ? ` · ${match.companyDetails.industry}` : ""}
//                       </p>
//                       <p className="text-xs text-gray-400 mb-3 line-clamp-2">
//                         {match.rawDescription}
//                       </p>
//                       <div className="flex flex-wrap gap-1.5">
//                         {match.extractedSkills?.slice(0, 5).map((s) => (
//                           <span key={s} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
//                             {s}
//                           </span>
//                         ))}
//                         {match.extractedSkills?.length > 5 && (
//                           <span className="text-xs text-gray-400">
//                             +{match.extractedSkills.length - 5} more
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     <Link
//                       to={`/candidate/jobs/${match._id}`}
//                       className="ml-4 flex-shrink-0 text-xs px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//                     >
//                       View Details
//                     </Link>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Applications */}
//       {tab === "applications" && (
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//           {applications.length === 0 ? (
//             <p className="text-sm text-gray-400 text-center py-12">
//               You haven't applied to any jobs yet.
//             </p>
//           ) : (
//             <div className="divide-y divide-gray-100">
//               {applications.map((app) => {
//                 const job = app.job as any;
//                 const company = app.company as any;
//                 return (
//                   <div key={app._id} className="px-6 py-4 flex items-center gap-4">
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-gray-900">
//                         {job?.extractedRoles?.join(", ") || "Job"}
//                       </p>
//                       <p className="text-xs text-gray-500">{company?.companyName}</p>
//                     </div>
//                     <ApplicationStatusBadge status={app.status} />
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// function ApplicationStatusBadge({ status }: { status: string }) {
//   const colors: Record<string, string> = {
//     applied: "bg-gray-100 text-gray-600",
//     shortlisted: "bg-blue-50 text-blue-700",
//     interview: "bg-purple-50 text-purple-700",
//     rejected: "bg-red-50 text-red-600",
//     hired: "bg-green-50 text-green-700",
//   };
//   return (
//     <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
//       {status}
//     </span>
//   );
// }








import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getJobMatches,
  getMyApplications,
  withdrawApplication,
  getMyInterviews,
  respondToInterview,
} from "../../api/candidateApi";
import type { JobMatch, Application, Interview } from "../../types";
import Loader from "../../components/common/Loader";

type DashboardTab = "matches" | "applications" | "interviews";

export default function CandidateDashboard() {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<DashboardTab>("matches");

  const fetchData = async () => {
    try {
      setError("");

      const [matchRes, appRes, interviewRes] = await Promise.all([
        getJobMatches().catch(() => ({ matches: [] })),
        getMyApplications().catch(() => ({ applications: [] })),
        getMyInterviews().catch(() => ({ interviews: [] })),
      ]);

      setMatches(matchRes.matches ?? []);
      setApplications(appRes.applications ?? []);
      setInterviews(interviewRes.interviews ?? []);
    } catch {
      setError("Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdrawApplication = async (applicationId: string) => {
    const confirmWithdraw = window.confirm(
      "Are you sure you want to withdraw this application?"
    );

    if (!confirmWithdraw) return;

    try {
      setActionLoading(applicationId);

      const res = await withdrawApplication(applicationId);

      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: "withdrawn" } : app
        )
      );

      alert(res.message || "Application withdrawn successfully");
      setTab("applications");
      await fetchData();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to withdraw application"
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleInterviewResponse = async (
    interviewId: string,
    response: "confirmed" | "declined"
  ) => {
    try {
      setActionLoading(interviewId);

      const res = await respondToInterview(interviewId, response);

      setInterviews((prev) =>
        prev.map((interview) =>
          interview._id === interviewId ? res.interview : interview
        )
      );

      alert(`Interview ${response} successfully.`);
      await fetchData();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to respond to interview"
      );
    } finally {
      setActionLoading("");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Jobs matched to your skills and your application statuses
          </p>
        </div>

        <Link
          to="/candidate/profile"
          className="text-sm font-medium text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Update Profile
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {(["matches", "applications", "interviews"] as DashboardTab[]).map(
          (t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                tab === t
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}{" "}
              {t === "matches"
                ? `(${matches.length})`
                : t === "applications"
                ? `(${applications.length})`
                : `(${interviews.length})`}
            </button>
          )
        )}
      </div>

      {tab === "matches" && (
        <div>
          {matches.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-gray-400 text-sm mb-3">
                No job matches yet. Upload your resume or add skills to your profile first.
              </p>

              <Link
                to="/candidate/profile"
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Set up your profile →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {matches.map((match) => (
                <div
                  key={match._id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {match.extractedRoles?.join(", ") || "Role"}
                        </h3>

                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            match.matchPercentage >= 80
                              ? "bg-green-50 text-green-700"
                              : match.matchPercentage >= 60
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {match.matchPercentage}% match
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mb-2">
                        {match.companyDetails?.companyName}
                        {match.companyDetails?.industry
                          ? ` · ${match.companyDetails.industry}`
                          : ""}
                      </p>

                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                        {match.rawDescription}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {match.extractedSkills?.slice(0, 5).map((s: string) => (
                          <span
                            key={s}
                            className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full"
                          >
                            {s}
                          </span>
                        ))}

                        {match.extractedSkills?.length > 5 && (
                          <span className="text-xs text-gray-400">
                            +{match.extractedSkills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/candidate/jobs/${match._id}`}
                      className="ml-4 flex-shrink-0 text-xs px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "applications" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {applications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">
              You haven't applied to any jobs yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map((app) => {
                const job = app.job as any;
                const company = app.company as any;

                const canWithdraw =
                  app.status !== "withdrawn" &&
                  app.status !== "hired" &&
                  app.status !== "rejected";

                return (
                  <div
                    key={app._id}
                    className="px-6 py-4 flex items-center gap-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {job?.extractedRoles?.join(", ") || "Job"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {company?.companyName}
                      </p>
                    </div>

                    <ApplicationStatusBadge status={app.status} />

                    {canWithdraw && (
                      <button
                        onClick={() => handleWithdrawApplication(app._id)}
                        disabled={actionLoading === app._id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                      >
                        {actionLoading === app._id
                          ? "Withdrawing..."
                          : "Withdraw"}
                      </button>
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
          {interviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">
              No interviews scheduled yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {interviews.map((interview) => {
                const job = interview.job as any;
                const company = interview.company as any;
                const canRespond = interview.status === "proposed";

                return (
                  <div key={interview._id} className="px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {job?.extractedRoles?.join(", ") || "Interview"}
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">
                          {company?.companyName || "Company"}
                          {company?.industry ? ` · ${company.industry}` : ""}
                        </p>

                        <p className="text-sm text-gray-700 mt-3">
                          {new Date(interview.scheduledAt).toLocaleString()}
                        </p>

                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          Mode: {interview.mode}
                        </p>

                        {interview.meetingDetails && (
                          <p className="text-xs text-blue-600 mt-1">
                            {interview.meetingDetails}
                          </p>
                        )}

                        {interview.notes && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                            {interview.notes}
                          </p>
                        )}
                      </div>

                      <InterviewStatusBadge status={interview.status} />
                    </div>

                    {canRespond && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() =>
                            handleInterviewResponse(interview._id, "confirmed")
                          }
                          disabled={actionLoading === interview._id}
                          className="text-xs px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          Confirm
                        </button>

                        <button
                          onClick={() =>
                            handleInterviewResponse(interview._id, "declined")
                          }
                          disabled={actionLoading === interview._id}
                          className="text-xs px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ApplicationStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    applied: "bg-gray-100 text-gray-600",
    shortlisted: "bg-blue-50 text-blue-700",
    interview: "bg-purple-50 text-purple-700",
    rejected: "bg-red-50 text-red-600",
    hired: "bg-green-50 text-green-700",
    withdrawn: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
        colors[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
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
    <span
      className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
        colors[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}