import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="bg-blue-50 min-h-screen flex items-center justify-center text-center">
      <div className="bg-white p-10 rounded-lg shadow-xl w-full sm:w-1/2 lg:w-1/3">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">404 - Página no encontrada</h1>
        <p className="text-lg text-gray-700 mb-6">
          La página que buscas no existe. Por favor, regresa a la página principal.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Ir al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

