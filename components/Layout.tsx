import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { LogOut, Bell, Search, Menu, X, Check, Lock } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, notifications, unreadCount, markNotificationRead, markAllNotificationsRead, assessmentCount, hasResumeAnalysis } = useUserData();

  // Determine which nav items are locked
  const lockedPaths = useMemo(() => {
    const hasSkills = (profile?.skills?.length ?? 0) > 0;
    const hasTargetRole = !!profile?.target_role;
    const profileReady = hasSkills && hasTargetRole;
    const fullReady = profileReady && assessmentCount >= 2 && hasResumeAnalysis;

    const locked = new Set<string>();
    if (!profileReady) {
      locked.add('/careers');
      locked.add('/gaps');
      locked.add('/learning');
    }
    if (!fullReady) {
      locked.add('/jobs');
    }
    return locked;
  }, [profile, assessmentCount, hasResumeAnalysis]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Desktop: collapsed by default on mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAuthPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const searchMap: Record<string, string> = {
      'dashboard': '/dashboard',
      'profile': '/profile',
      'assessment': '/assessment',
      'skill': '/assessment',
      'resume': '/resume',
      'career': '/careers',
      'job': '/jobs',
      'gap': '/gaps',
      'learning': '/learning',
      'course': '/learning',
      'interview': '/mock',
      'mock': '/mock',
    };

    const query = searchQuery.toLowerCase();
    for (const [key, path] of Object.entries(searchMap)) {
      if (query.includes(key)) {
        navigate(path);
        setSearchQuery('');
        setShowSearchResults(false);
        return;
      }
    }
    setShowSearchResults(false);
  };

  const searchResults = searchQuery.trim()
    ? NAVIGATION_ITEMS.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar - Desktop: static, Mobile: drawer overlay */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isSidebarOpen ? 'w-64' : 'w-64 md:w-20'}
          bg-[#0f172a] text-white flex flex-col transition-all duration-300 ease-in-out
        `}
      >
        <div className="p-6 flex items-center justify-between">
          {(isSidebarOpen || isMobileMenuOpen) ? (
            <Link to="/dashboard" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="bg-blue-600 p-1.5 rounded-lg">ST</span>
              SkillTrack
            </Link>
          ) : (
            <Link to="/dashboard" className="bg-blue-600 p-2 rounded-lg mx-auto hidden md:block">ST</Link>
          )}
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const isLocked = lockedPaths.has(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isLocked
                    ? 'text-slate-600 hover:bg-slate-800/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className={`${isActive ? 'text-white' : isLocked ? 'text-slate-600' : 'text-slate-400 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                {(isSidebarOpen || isMobileMenuOpen) && (
                  <span className={`ml-3 font-medium flex-1 ${isLocked ? 'text-slate-600' : ''}`}>{item.name}</span>
                )}
                {(isSidebarOpen || isMobileMenuOpen) && isLocked && (
                  <Lock size={14} className="text-slate-600 flex-shrink-0" />
                )}
                {/* Show labels only on desktop collapsed state via tooltip-like hidden text */}
                {!isSidebarOpen && !isMobileMenuOpen && (
                  <span className="hidden md:hidden">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {(isSidebarOpen || isMobileMenuOpen) && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-20 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-md"
            >
              <Menu size={22} />
            </button>
            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:block text-slate-500 hover:text-slate-800 p-1 rounded-md"
            >
              {isSidebarOpen ? <Menu size={20} /> : <X size={20} />}
            </button>
            <div className="relative hidden md:block">
              <form onSubmit={handleSearch}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  placeholder="Search pages, resources..."
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 lg:w-64"
                />
              </form>
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50">
                  {searchResults.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 font-medium"
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden max-w-sm">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${
                            !notif.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              !notif.read ? 'bg-blue-500' : 'bg-transparent'
                            }`}></div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900">{notif.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5 break-words">{notif.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

            <Link to="/profile" className="flex items-center gap-2 md:gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-[120px] lg:max-w-none">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-[120px] lg:max-w-none">
                  {profile?.target_role || 'Set your target role'}
                </p>
              </div>
              <div className="h-9 w-9 md:h-10 md:w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200 overflow-hidden font-bold text-sm flex-shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="object-cover w-full h-full" />
                ) : (
                  initials
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
