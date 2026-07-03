import { useEffect, useState, useRef } from "react";
import {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  generateEmbedding,
} from "../../api/candidateApi";
import type { Candidate } from "../../types";
import Loader from "../../components/common/Loader";

export default function CandidateProfile() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingEmbed, setGeneratingEmbed] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    careerGoal: "",
    experienceYears: 0,
    skillsInput: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setCandidate(data);
        setForm({
          careerGoal: data.careerGoal ?? "",
          experienceYears: data.experienceYears ?? 0,
          skillsInput: data.skills?.join(", ") ?? "",
        });
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const skills = form.skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { candidate: updated } = await updateMyProfile({
        careerGoal: form.careerGoal,
        experienceYears: form.experienceYears,
        skills,
      });
      setCandidate(updated);
      setSuccess("Profile saved. Don't forget to regenerate your embedding.");
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const result = await uploadResume(file);
      setCandidate((prev) =>
        prev
          ? {
              ...prev,
              skills: result.candidate.skills ?? prev.skills,
              experienceYears: result.candidate.experienceYears ?? prev.experienceYears,
              careerGoal: result.candidate.careerGoal ?? prev.careerGoal,
            }
          : prev
      );
      setForm({
        careerGoal: result.candidate.careerGoal ?? "",
        experienceYears: result.candidate.experienceYears ?? 0,
        skillsInput: result.candidate.skills?.join(", ") ?? "",
      });
      setSuccess(
        `Resume parsed! Extracted ${result.candidate.skills?.length ?? 0} skills. Embedding was regenerated automatically.`
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Resume upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleGenerateEmbedding = async () => {
    setGeneratingEmbed(true);
    setError("");
    setSuccess("");
    try {
      await generateEmbedding();
      setSuccess("Embedding regenerated. Your profile is now searchable by companies.");
    } catch {
      setError("Failed to generate embedding.");
    } finally {
      setGeneratingEmbed(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
      <p className="text-sm text-gray-500 mb-8">
        Keep your profile updated so the AI can match you with the best opportunities.
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

      {/* Resume upload */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">
          Upload Resume (PDF)
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          AI will auto-extract your skills, experience, and career goal — no manual entry needed.
        </p>

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">Parsing resume with AI...</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 font-medium">Click to upload your resume</p>
              <p className="text-xs text-gray-400 mt-1">PDF only, max 5MB</p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleResumeUpload}
        />
      </div>

      {/* Edit profile form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Profile Details</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <p className="text-sm text-gray-600 px-4 py-2.5 bg-gray-50 rounded-lg">
              {candidate?.fullName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Career Goal
            </label>
            <input
              type="text"
              value={form.careerGoal}
              onChange={(e) => setForm((f) => ({ ...f, careerGoal: e.target.value }))}
              placeholder="e.g. Full Stack Developer specializing in MERN stack"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={form.experienceYears}
              onChange={(e) =>
                setForm((f) => ({ ...f, experienceYears: parseInt(e.target.value) || 0 }))
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills (comma separated)
            </label>
            <textarea
              rows={3}
              value={form.skillsInput}
              onChange={(e) => setForm((f) => ({ ...f, skillsInput: e.target.value }))}
              placeholder="React, Node.js, MongoDB, TypeScript..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.skillsInput.split(",").filter((s) => s.trim()).length} skills
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      {/* Regenerate embedding */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">
          Searchability Embedding
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          After updating your skills manually, regenerate your embedding so companies can find you
          via AI-powered semantic search. (Uploading a resume does this automatically.)
        </p>
        <button
          onClick={handleGenerateEmbedding}
          disabled={generatingEmbed}
          className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {generatingEmbed ? "Generating..." : "Regenerate Embedding"}
        </button>
      </div>
    </div>
  );
}