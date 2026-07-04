import { useEffect, useState } from "react";
import { getMyInterviews, respondToInterview } from "../../api/candidateApi";
import type { Interview } from "../../types";
import Loader from "../../components/common/Loader";

export default function CandidateInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await getMyInterviews();
        setInterviews(res.interviews ?? []);
      } catch {
        setError("Failed to load interviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const handleResponse = async (
    interviewId: string,
    response: "confirmed" | "declined"
  ) => {
    try {
      setActionLoading(interviewId);
      setError("");
      setSuccess("");

      const res = await respondToInterview(interviewId, response);

      setInterviews((prev) =>
        prev.map((interview) =>
          interview._id === interviewId ? res.interview : interview
        )
      );

      setSuccess(`Interview ${response} successfully.`);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to respond to interview.");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Interviews</h1>
      <p className="text-sm text-gray-500 mb-8">
        View interview schedules and confirm or decline recruiter invitations.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
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
                        onClick={() => handleResponse(interview._id, "confirmed")}
                        disabled={actionLoading === interview._id}
                        className="text-xs px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Confirm
                      </button>

                      <button
                        onClick={() => handleResponse(interview._id, "declined")}
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
    </div>
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