import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyJobs, deleteJob, analyzeJob } from "../../api/jobsApi";
import { getCompanyDashboard } from "../../api/companyApi";
import type { Job, CompanyDashboard as CompanyDashboardType } from "../../types";
import Loader from "../../components/common/Loader";

export default function CompanyDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dashboard, setDashboard] = useState<CompanyDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, dashData] = await Promise.all([
          getMyJobs(),
          getCompanyDashboard(),
        ]);
        setJobs(jobsData);
        setDashboard(dashData);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAnalyze = async (jobId: string) => {
    setAnalyzingId(jobId);
    try {
      const { job: updatedJob } = await analyzeJob(jobId);
      setJobs((prev) => prev.map((j) => (j._id === jobId ? updatedJob : j)));
    } catch {
      setError("Failed to analyze job.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Delete this job posting?")) return;
    setDeletingId(jobId);
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch {
      setError("Failed to delete job.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your job postings and track applicants
          </p>
        </div>
        <Link
          to="/company/post-job"
          className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Post New Job
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats row */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Jobs", value: dashboard.totalJobs },
            { label: "Total Applicants", value: dashboard.totalApplicants },
            { label: "Shortlisted", value: dashboard.applicantsByStage.shortlisted ?? 0 },
            { label: "Hired", value: dashboard.applicantsByStage.hired ?? 0 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
            >
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Jobs list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Your Job Postings</h2>
        </div>

        {jobs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400 text-sm">No jobs posted yet.</p>
            <Link
              to="/company/post-job"
              className="mt-3 inline-block text-blue-600 text-sm font-medium hover:underline"
            >
              Post your first job →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map((job) => {
              const isAnalyzed = job.extractedSkills?.length > 0;
              return (
                <div key={job._id} className="px-6 py-4 flex items-center gap-4">
                  {/* Job info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {job.extractedRoles?.length > 0
                        ? job.extractedRoles.join(", ")
                        : "Unanalyzed job"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {job.rawDescription}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StatusBadge status={job.status} />
                      {isAnalyzed ? (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Analyzed
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">
                          Needs analysis
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isAnalyzed && (
                      <button
                        onClick={() => handleAnalyze(job._id)}
                        disabled={analyzingId === job._id}
                        className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50 transition-colors"
                      >
                        {analyzingId === job._id ? "Analyzing..." : "Analyze"}
                      </button>
                    )}
                    {isAnalyzed && (
                      <Link
                        to={`/company/jobs/${job._id}`}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        View Matches
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(job._id)}
                      disabled={deletingId === job._id}
                      className="text-xs px-3 py-1.5 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      {deletingId === job._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: "bg-green-50 text-green-700",
    closed: "bg-gray-100 text-gray-600",
    "in-progress": "bg-blue-50 text-blue-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}