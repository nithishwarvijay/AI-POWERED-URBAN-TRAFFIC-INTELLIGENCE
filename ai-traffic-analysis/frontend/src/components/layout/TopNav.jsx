import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Menu,
  ChevronDown,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function TopNav({ onMenuClick, breadcrumbs = [] }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mockNotifications = [
    { id: 1, type: 'warning', message: 'High congestion detected at Junction 04', time: '2 min ago', unread: true },
    { id: 2, type: 'info', message: 'Traffic signal optimization completed', time: '15 min ago', unread: true },
    { id: 3, type: 'success', message: 'Emergency vehicle priority activated', time: '1 hour ago', unread: false },
  ];

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <header className="h-16 bg-white dark:bg-navy-900 border-b border-gray-200 dark:border-navy-800 flex items-center px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center justify-between w-full">
        {/* Left Section - Mobile Brand & Desktop Breadcrumbs */}
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Project Brand - Visible ONLY on mobile/tablet screens (Sidebar renders main brand on desktop) */}
          <Link to="/dashboard" className="lg:hidden flex items-center gap-2.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl min-w-0">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="text-left hidden sm:block min-w-0">
              <span className="text-xs font-bold text-navy-900 dark:text-white leading-tight truncate block">Urban Traffic</span>
              <p className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 leading-none truncate">AI Powered</p>
            </div>
          </Link>

          {/* Breadcrumbs Navigation on Desktop */}
          {breadcrumbs.length > 0 && (
            <nav className="hidden lg:flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <span className="text-gray-400 dark:text-gray-600 font-bold">/</span>
                  )}
                  {crumb.href ? (
                    <Link 
                      to={crumb.href}
                      className="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-xs tracking-wide"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-[#0F172A] dark:text-white font-semibold text-xs tracking-wide bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-800/50">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Right Section - Search, Notifications, Theme Toggle, User Menu */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-navy-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-navy-800 dark:text-white transition-colors"
              />
            </div>
          </div>

          {/* System Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <Activity className="w-4 h-4 text-green-600 dark:text-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">Live</span>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-800 rounded-lg shadow-xl border border-gray-200 dark:border-navy-700 py-2 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-navy-700">
                  <h3 className="font-semibold text-navy-900 dark:text-white">Notifications</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{unreadCount} unread</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {mockNotifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-navy-700 cursor-pointer ${
                        notification.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <p className="text-sm text-navy-900 dark:text-white mb-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-200 dark:border-navy-700">
                  <Link 
                    to="/alerts" 
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-navy-900 dark:text-white">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role || 'User'}
                </p>
              </div>
              <ChevronDown className="hidden lg:block w-4 h-4 text-gray-400" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-800 rounded-lg shadow-xl border border-gray-200 dark:border-navy-700 py-2 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-navy-700">
                  <p className="font-medium text-navy-900 dark:text-white">{user?.full_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                
                <div className="py-2">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-gray-200 dark:border-navy-700 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
