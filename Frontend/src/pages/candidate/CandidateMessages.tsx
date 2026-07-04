import { useEffect, useState } from "react";
import {
  getMyMessages,
  getJobConversation,
  sendCandidateMessage,
} from "../../api/candidateApi";
import type { Message } from "../../types";
import Loader from "../../components/common/Loader";

export default function CandidateMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState("Conversation");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await getMyMessages();
        setMessages(res.messages ?? []);
      } catch {
        setError("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const getJobId = (msg: Message) => {
    if (!msg.job) return null;
    return typeof msg.job === "object" ? msg.job._id : msg.job;
  };

  const getJobTitle = (msg: Message) => {
    if (!msg.job) return "Job Conversation";

    if (typeof msg.job === "object") {
      return msg.job.extractedRoles?.join(", ") || "Job Conversation";
    }

    return "Job Conversation";
  };

  const getCompanyName = (msg: Message) => {
    if (!msg.company) return "Company";

    if (typeof msg.company === "object") {
      return msg.company.companyName || "Company";
    }

    return "Company";
  };

  const conversationJobIds = Array.from(
    new Set(messages.map((msg) => getJobId(msg)).filter(Boolean))
  ) as string[];

  const handleOpenConversation = async (jobId: string) => {
    setSelectedJobId(jobId);
    setConversationLoading(true);
    setError("");

    const firstMessage = messages.find((msg) => getJobId(msg) === jobId);
    if (firstMessage) {
      setSelectedTitle(getJobTitle(firstMessage));
    }

    try {
      const res = await getJobConversation(jobId);
      setConversation(res.messages ?? []);
    } catch {
      setError("Failed to load conversation.");
    } finally {
      setConversationLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedJobId || !newMessage.trim()) return;

    setSending(true);
    setError("");

    try {
      const res = await sendCandidateMessage(selectedJobId, newMessage.trim());
      setConversation((prev) => [...prev, res.data]);
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch {
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
      <p className="text-sm text-gray-500 mb-8">
        View recruiter invitations and reply to companies.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Conversations
            </h2>
          </div>

          {conversationJobIds.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">
              No messages yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversationJobIds.map((jobId) => {
                const msg = messages.find((m) => getJobId(m) === jobId);

                return (
                  <button
                    key={jobId}
                    onClick={() => handleOpenConversation(jobId)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedJobId === jobId
                        ? "bg-blue-50 border-l-2 border-blue-600"
                        : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {msg ? getJobTitle(msg) : "Job Conversation"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {msg ? getCompanyName(msg) : "Company"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[520px] flex flex-col">
          {!selectedJobId ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-gray-400">
                Select a conversation to view messages.
              </p>
            </div>
          ) : conversationLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">
                  {selectedTitle}
                </h2>
              </div>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {conversation.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-12">
                    No conversation messages yet.
                  </p>
                ) : (
                  conversation.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.senderRole === "candidate"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-md px-4 py-2 rounded-xl text-sm ${
                          msg.senderRole === "candidate"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {msg.type === "invitation" && (
                          <p className="text-xs font-semibold mb-1 opacity-75">
                            Interview Invitation
                          </p>
                        )}

                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a reply..."
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}