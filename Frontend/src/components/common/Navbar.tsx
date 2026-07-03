import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={user ? (user.role === "company" ? "/company" : "/candidate") : "/"}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">
            ProfileHub <span className="text-blue-600">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        {user && (
          <div className="flex items-center gap-6">
            {user.role === "company" ? (
              <>
                <Link
                  to="/company"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/company/post-job"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Post Job
                </Link>
                <Link
                  to="/company/profile"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/candidate"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/candidate/profile"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Profile
                </Link>
                <Link
                  to="/candidate/career-tools"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Career Tools
                </Link>
              </>
            )}

            {/* Role badge + logout */}
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700 capitalize">
                {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}