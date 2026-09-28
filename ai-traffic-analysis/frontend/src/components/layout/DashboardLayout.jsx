import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function DashboardLayout({ children, breadcrumbs = [] }) {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={toggleSidebar}
          user={user}
        />
      </div>

      {/* Sidebar - Mobile */}
      {mobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={toggleMobileSidebar}
          ></div>
          
          {/* Mobile Sidebar */}
          <div className="lg:hidden fixed left-0 top-0 z-50 h-screen animate-slide-in">
            <Sidebar 
              isCollapsed={false} 
              onToggleCollapse={toggleMobileSidebar}
              user={user}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      }`}>
        <TopNav onMenuClick={toggleMobileSidebar} breadcrumbs={breadcrumbs} />
        
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
