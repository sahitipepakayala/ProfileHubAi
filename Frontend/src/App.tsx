import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
// Auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Company pages
import CompanyDashboard from "./pages/company/CompanyDashboard";
import PostJob from "./pages/company/PostJob";
import JobDetail from "./pages/company/JobDetail";
import CompanyProfile from "./pages/company/CompanyProfile";

// Candidate pages
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import CandidateProfile from "./pages/candidate/CandidateProfile";
import JobMatchDetail from "./pages/candidate/JobMatchDetail";
import CareerTools from "./pages/candidate/CareerTools";
import CandidateInterviews from "./pages/candidate/CandidateInterviews";
import CandidateMessages from "./pages/candidate/CandidateMessages";
// Common
import Navbar from "./components/common/Navbar";
import Loader from "./components/common/Loader";

// ─── Route Guards ────────────────────────────────────────────────────────────

const RequireRole = ({
  role,
  children,
}: {
  role: "company" | "candidate";
  children: React.ReactNode;
}) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    // Wrong role — redirect to their own dashboard
    return <Navigate to={user.role === "company" ? "/company" : "/candidate"} replace />;
  }
  return <>{children}</>;
};

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const { isLoading } = useAuth();
  if (isLoading) return <Loader />;

  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Company routes */}
          <Route
            path="/company"
            element={<RequireRole role="company"><CompanyDashboard /></RequireRole>}
          />
          <Route
            path="/company/post-job"
            element={<RequireRole role="company"><PostJob /></RequireRole>}
          />
          <Route
            path="/company/jobs/:id"
            element={<RequireRole role="company"><JobDetail /></RequireRole>}
          />
          <Route
            path="/company/profile"
            element={<RequireRole role="company"><CompanyProfile /></RequireRole>}
          />

          {/* Candidate routes */}
          <Route
            path="/candidate"
            element={<RequireRole role="candidate"><CandidateDashboard /></RequireRole>}
          />
          <Route
            path="/candidate/profile"
            element={<RequireRole role="candidate"><CandidateProfile /></RequireRole>}
          />
          <Route
            path="/candidate/jobs/:id"
            element={<RequireRole role="candidate"><JobMatchDetail /></RequireRole>}
          />
          <Route
            path="/candidate/career-tools"
            element={<RequireRole role="candidate"><CareerTools /></RequireRole>}
          />
          <Route
  path="/candidate/career-tools"
  element={<RequireRole role="candidate"><CareerTools /></RequireRole>}
/>

<Route
  path="/candidate/messages"
  element={<RequireRole role="candidate"><CandidateMessages /></RequireRole>}
/>
<Route
  path="/candidate/interviews"
  element={<RequireRole role="candidate"><CandidateInterviews /></RequireRole>}
/>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}