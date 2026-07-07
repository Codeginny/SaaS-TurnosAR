import React from 'react';
import { Outlet } from 'react-router-dom';
import ProfessionalSidebar from './ProfessionalSidebar';

const ProfessionalLayout = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <ProfessionalSidebar />
      
      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfessionalLayout;
