import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Search, Menu, X, Stethoscope } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Simple auth state based on localStorage token
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // We check token on mount and also set up an interval to keep it synced
  // in case they log in on another tab or we want it to update immediately
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    checkAuth();
    // In a real app we'd use a Context or Redux store, but an interval 
    // or listening to a custom event works for this simple token check
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-800">
              Medeli<span className="text-primary-600">RDV</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isLoggedIn && (
              <Link to="/search" className="text-slate-600 hover:text-primary-600 font-medium transition-colors flex items-center gap-1.5">
                <Search className="w-4 h-4" />
                Find a Doctor
              </Link>
            )}

            {isLoggedIn ? (
              <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 font-medium transition-colors flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <div className="h-6 w-px bg-slate-200"></div>
                <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md shadow-primary-600/20 hover:shadow-lg flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-primary-600 focus:outline-none p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full glass border-b border-white/20 shadow-xl pb-4 pt-2 px-4 flex flex-col space-y-4">
          {!isLoggedIn && (
            <Link to="/search" onClick={() => setIsMenuOpen(false)} className="text-slate-700 font-medium p-2 hover:bg-primary-50 rounded-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-primary-500" />
              Find a Doctor
            </Link>
          )}
          
          {isLoggedIn ? (
            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-slate-700 font-medium p-2 hover:bg-primary-50 rounded-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              Dashboard
            </Link>
          ) : (
            <>
              <div className="h-px w-full bg-slate-200 my-2"></div>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-slate-700 font-medium p-2 hover:bg-primary-50 rounded-lg">
                Log in
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="bg-primary-600 text-white text-center p-3 rounded-xl font-medium mt-2">
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
