import { useRef, useState } from "react";
import { uploadResume } from "../../api/candidateApi";
import type { Candidate } from "../../types";

interface ResumeUploadProps {
  onUploaded?: (extracted: Partial<Candidate>) => void;
}

// Equivalent to the upload block already inline in CandidateProfile.tsx.
// Not currently used there — available if you want to extract it later.
export default function ResumeUpload({ onUploaded }: ResumeUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const result = await uploadResume(file);
      onUploaded?.(result.candidate);
    } catch (err: any) {
      setError(err.response?.data?.message || "Resume upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      )}
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
      <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} />
    </div>
  );
}