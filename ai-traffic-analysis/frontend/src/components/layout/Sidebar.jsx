import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  BarChart2,
  Video,
  TrafficCone,
  AlertTriangle,
  Route,
  FileText,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Car,
  Siren,
  Cpu,
} from 'lucide-react';

const navigation = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'live-traffic', label: 'Live Traffic', icon: Radio, path: '/live-traffic' },
  { key: 'analytics', label: 'Traffic Analytics', icon: BarChart2, path: '/analytics' },
  { key: 'vehicle-detection', label: 'Vehicle Detection', icon: Video, path: '/vehicle-detection' },
  { key: 'signal-optimization', label: 'Signal Optimization', icon: TrafficCone, path: '/signals' },
  { key: 'emergency-vehicles', label: 'Emergency Vehicles', icon: Siren, path: '/emergency' },
  { key: 'route-intelligence', label: 'Route Intelligence', icon: Route, path: '/routes' },
  { key: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
  { key: 'alerts', label: 'Alerts', icon: Bell, path: '/alerts' },
];

const bottomItems = [
  { key: 'help', label: 'Help & Support', icon: HelpCircle, path: '/help' },
  { key: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ isCollapsed, onToggleCollapse, user }) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const isActive = (path) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white dark:bg-navy-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
      onMouseEnter={() => setHoveredItem('sidebar')}
      onMouseLeave={() => setHoveredItem(null)}
    >
      {/* Logo Header */}
      <div className={`flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-navy-800 ${isCollapsed ? 'justify-center px-2' : ''}`}>
        <Link to="/dashboard" className="flex items-center gap-3 flex-1 min-w-0 group" aria-label="Urban Traffic Intelligence Dashboard">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Car size={18} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden min-w-0 flex flex-col justify-center">
              <span className="font-bold text-sm text-[#0F172A] dark:text-white truncate block leading-snug tracking-tight">
                Urban Traffic Intelligence
              </span>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase block leading-none">
                AI Powered Platform
              </span>
            </div>
          )}
        </Link>
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors flex-shrink-0 ml-1"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto" aria-label="Main navigation">
        <ul className="space-y-1" role="list">
          {navigation.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.key}>
                <Link
                  to={item.path}
                  className={`sidebar-link group ${active ? 'sidebar-link-active' : ''} relative`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="flex-shrink-0" aria-hidden="true">
                    <item.icon size={20} className={active ? 'text-primary-600 dark:text-primary-400' : ''} />
                  </span>
                  {!isCollapsed && (
                    <span className="flex-1 truncate transition-opacity duration-200">{item.label}</span>
                  )}
                  {active && !isCollapsed && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-r-full" />
                  )}
                </Link>
                {!isCollapsed && hoveredItem === item.key && (
                  <div className="ml-10 mt-1 text-[11px] text-gray-500 px-2 py-1 rounded bg-gray-50 dark:bg-navy-800">
                    {item.label} overview
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Account</p>
          <ul className="space-y-1 mt-2" role="list">
            <li>
              <Link to="/profile" className="sidebar-link group">
                <span className="flex-shrink-0"><User size={20} /></span>
                {!isCollapsed && <span className="flex-1 truncate">Profile</span>}
              </Link>
            </li>
            {user?.role === 'administrator' && (
              <li>
                <Link to="/users" className="sidebar-link group">
                  <span className="flex-shrink-0"><Cpu size={20} /></span>
                  {!isCollapsed && <span className="flex-1 truncate">User Management</span>}
                </Link>
              </li>
            )}
            <li>
              <button className="sidebar-link group w-full text-left">
                <span className="flex-shrink-0"><LogOut size={20} /></span>
                {!isCollapsed && <span className="flex-1 truncate text-danger-600 dark:text-danger-400">Logout</span>}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Bottom - User info when not collapsed */}
      {!isCollapsed && user && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-primary-700 dark:text-primary-400 font-medium text-sm">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="absolute left-full top-0 h-full w-48 bg-white dark:bg-navy-900 border border-gray-200 dark:border-gray-800 shadow-elevated z-50" style={{ display: hoveredItem === 'sidebar' ? 'block' : 'none' }}>
          <nav className="p-4 overflow-y-auto h-full">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    className={`sidebar-link ${isActive(item.path) ? 'sidebar-link-active' : ''}`}
                  >
                    <span className="flex-shrink-0"><item.icon size={20} /></span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </aside>
  );
}