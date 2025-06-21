
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen" style={{ background: '#6366f1' }}>
      {/* Header */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-blue-600 font-black text-lg">BD</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute top-2 -right-2 w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="text-2xl font-bold text-white">Base Demo</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
            <h1 className="text-6xl font-bold text-white mb-4">404</h1>
            <p className="text-xl text-blue-100 mb-6">Oops! Page not found</p>
            <p className="text-blue-200 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Button
              onClick={() => navigate('/')}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-bold transition-all shadow-xl hover:shadow-2xl rounded-2xl"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-blue-200">
          <p>Built for educational purposes. Trade responsibly in real markets.</p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
