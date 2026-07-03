interface ErrorMessageProps {
  message?: string | null;
  className?: string;
}

// Matches the inline error banner pattern already repeated across your pages
// (e.g. JobDetail, CompanyDashboard). Not currently used anywhere — available
// to de-duplicate that markup later.
export default function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className={`p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 ${className}`}>
      {message}
    </div>
  );
}