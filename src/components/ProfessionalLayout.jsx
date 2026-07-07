import React from 'react';
import { Outlet } from 'react-router-dom';
import ProfessionalSidebar from './ProfessionalSidebar';

const ProfessionalLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
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
