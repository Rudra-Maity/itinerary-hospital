import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, HelpCircle, Settings, Menu, LogOutIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from './admin/AdminSidebar';
import DashContent from './doctor/DashContent';
import AdminDashboardLayout from './admin/AdminDashboard';
import { Outlet } from 'react-router-dom';
import DoctorDashboardLayout from './doctor/DoctorDashboardLayout';

function DashboardLayout({ role }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial state
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  console.log(user.role);
  

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 sm:w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {user.role === 'doctor' ? <DashContent /> : <AdminSidebar />}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex w-full flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <button
                className="text-gray-500 focus:outline-none focus:text-gray-600 lg:hidden"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </button> 
              <p className='font-semibold text-lg'> <span className="text-orange-500 capitalize ">{user.role}</span> Dashboard</p>
              {/* <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </div> */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* Your main content goes here */}
            {role === 'doctor' ?  <Outlet />:''}
            {/* <Outlet /> */}
          </div>
        </main>
      </div>

      {/* Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}

export default DashboardLayout;
