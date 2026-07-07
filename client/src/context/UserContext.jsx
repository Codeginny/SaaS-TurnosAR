import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * @typedef {Object} User
 * @property {number} id - ID del usuario
 * @property {string} nombre - Nombre del usuario
 * @property {string} email - Email del usuario
 * @property {string} [role] - Rol: 'professional' o 'patient'
 * @property {boolean} [isProfessional] - Indica si es profesional
 * @property {string} [token] - Token JWT de autenticación
 */

/**
 * @typedef {Object} UserContextValue
 * @property {User|null} user - Datos del usuario autenticado
 * @property {boolean} loading - Estado de carga
 * @property {boolean} isProfessional - Indica si es profesional
 * @property {boolean} isPatient - Indica si es paciente
 * @property {Function} login - Función para iniciar sesión
 * @property {Function} logout - Función para cerrar sesión
 * @property {Function} updateUser - Función para actualizar datos del usuario
 */

const UserContext = createContext();

/**
 * Provider del contexto de autenticación de usuarios.
 * Maneja el estado global del usuario autenticado y persistencia en localStorage.
 *
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {JSX.Element} Provider del contexto de usuario
 */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.id) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Inicia sesión del usuario.
   * Almacena datos en estado y localStorage.
   *
   * @param {User} userData - Datos del usuario autenticado
   * @returns {void}
   */
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Cierra sesión del usuario.
   * Limpia estado y localStorage.
   *
   * @returns {void}
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  /**
   * Actualiza datos del usuario autenticado.
   * Merge shallow de datos con estado existente.
   *
   * @param {Partial<User>} newUserData - Datos a actualizar
   * @returns {void}
   */
  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isProfessional = user?.isProfessional || false;
  const isPatient = user && !user.isProfessional;

  const value = {
    user,
    loading,
    isProfessional,
    isPatient,
    login,
    logout,
    updateUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * Hook personalizado para acceder al contexto de usuario.
 * Debe usarse dentro de UserProvider.
 *
 * @returns {UserContextValue} Valor del contexto de usuario
 * @throws {Error} Si se usa fuera de UserProvider
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de UserProvider');
  }
  return context;
};

export default UserProvider;
