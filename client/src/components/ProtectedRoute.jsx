import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useUser();

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/patient-login" replace />;
  }

  // Si se especifican roles permitidos y el usuario no tiene ninguno de ellos
  if (allowedRoles.length > 0) {
    const userRole = user.isPatient ? 'patient' : 'professional';
    
    if (!allowedRoles.includes(userRole)) {
      // Redirigir al dashboard correspondiente según el rol del usuario
      if (userRole === 'patient') {
        return <Navigate to="/patient-dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
