import React, { createContext, useEffect, useMemo, useState } from 'react';
import { backendAPI } from '../api/axiosInstance';
import { toast } from 'react-toastify';

/**
 * @typedef {Object} Appointment
 * @property {number} id - ID del turno
 * @property {string} patientName - Nombre del paciente
 * @property {string} email - Email del paciente
 * @property {string} phone - Teléfono del paciente
 * @property {string} datetime - Fecha y hora en formato ISO (YYYY-MM-DDTHH:mm:ss)
 * @property {string} status - Estado: pendiente, confirmado, cancelado, completado
 * @property {string} professional - Nombre del profesional
 * @property {string} createdAt - Fecha de creación
 */

/**
 * @typedef {Object} AppointmentContextValue
 * @property {Array<Appointment>} appointments - Lista de turnos
 * @property {boolean} loading - Estado de carga
 * @property {string|null} error - Mensaje de error
 * @property {Function} fetchAppointments - Función para obtener turnos
 * @property {Function} createAppointment - Función para crear turno
 * @property {Function} updateAppointment - Función para actualizar turno
 * @property {Function} deleteAppointment - Función para eliminar turno
 */

export const AppointmentContext = createContext();

/**
 * Provider del contexto de gestión de turnos.
 * Maneja el estado global de turnos y operaciones CRUD.
 *
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {JSX.Element} Provider del contexto de turnos
 */
export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Mapea datos de la API a la estructura interna de la aplicación.
   * Convierte nombres de campos y formatos de fecha.
   *
   * @param {Object|Array} apiData - Datos crudos de la API
   * @returns {Appointment|Array<Appointment>} Datos mapeados a estructura de la app
   */
  const mapAPIToApp = (apiData) => {
    const mapItem = (item) => {
      // Postgres returns fecha as an ISO date string like "2026-07-07T03:00:00.000Z"
      const fechaStr = item.fecha && typeof item.fecha === 'string' ? item.fecha.split('T')[0] : item.fecha;
      // Postgres time is "09:00:00", we just need the prefix if it already has seconds, but just in case:
      const horaStr = item.hora && item.hora.length === 5 ? `${item.hora}:00` : item.hora;
      return {
        id: item.id,
        patientName: item.paciente_nombre || item.nombre,
        email: item.paciente_email || item.email,
        phone: item.paciente_telefono || item.telefono,
        datetime: `${fechaStr}T${horaStr}`,
        status: item.estado ? item.estado.charAt(0).toUpperCase() + item.estado.slice(1) : 'Pendiente',
        professional: item.profesional,
        createdAt: item.createdAt,
        precioConsulta: item.precio_consulta
      };
    };

    if (Array.isArray(apiData)) {
      return apiData.map(mapItem);
    } else {
      return mapItem(apiData);
    }
  };

  /**
   * Mapea datos de la estructura interna a formato de la API.
   * Convierte nombres de campos y formatos de fecha para API.
   *
   * @param {Appointment} appData - Datos en estructura de la app
   * @returns {Object} Datos formateados para la API
   */
  const mapAppToAPI = (appData) => {
    const [date, time] = appData.datetime.split('T');
    return {
      nombre: appData.patientName,
      email: appData.email,
      telefono: appData.phone,
      fecha: date,
      hora: time.split(':')[0] + ':' + time.split(':')[1],
      estado: appData.status,
      profesional: appData.professional || 'Dr. General'
    };
  };

  /**
   * Verifica si una fecha ISO es futura o presente.
   *
   * @param {string} iso - Fecha en formato ISO
   * @returns {boolean} True si la fecha es futura o presente
   */
  const isFuture = (iso) => {
    if (!iso) return false;
    const now = new Date();
    const d = new Date(iso);
    return d.getTime() >= now.getTime();
  };

  /**
   * Obtiene todos los turnos del paciente autenticado.
   * Carga datos desde API y actualiza estado global.
   *
   * @returns {Promise<void>} Actualiza estado con turnos
   */
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        setLoading(false);
        return;
      }
      
      // Determinar el endpoint basado en el tipo de usuario
      const endpoint = user.isProfessional 
        ? '/turnos' // Endpoint para profesionales (todos los turnos o sus turnos)
        : `/turnos/paciente/${user.id}`; // Endpoint para pacientes
        
      const response = await backendAPI.get(endpoint);
      const mappedData = mapAPIToApp(response.data);
      setAppointments(mappedData || []);
    } catch (err) {
      // Manejo silencioso de 401 (el interceptor ya redirige al login)
      if (err.response?.status !== 401) {
        console.error('Error fetching appointments:', err);
        setError('Error al obtener los turnos');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crea un nuevo turno médico.
   * Valida fecha futura, mapea datos y persiste en API.
   *
   * @param {Appointment} payload - Datos del nuevo turno
   * @returns {Promise<Appointment>} Turno creado
   * @throws {Error} Si la fecha es pasada o falla la API
   */
  const createAppointment = async (payload) => {
    try {
      if (!isFuture(payload.datetime)) throw new Error('Fecha pasada');
      
      const apiPayload = mapAppToAPI(payload);
      const response = await backendAPI.post('/turnos', apiPayload);
      const newAppointment = mapAPIToApp(response.data);
      
      setAppointments((prev) => [...prev, newAppointment]);
      toast.success('Turno creado con éxito');
      return newAppointment;
    } catch (err) {
      // Manejo silencioso de 401 (el interceptor ya redirige al login)
      if (err.response?.status !== 401) {
        console.error('Error creating appointment:', err);
        setError('Error al crear el turno');
      }
      throw err;
    }
  };

  /**
   * Actualiza un turno existente.
   * Simula actualización con delay para UX consistente.
   *
   * @param {number} id - ID del turno a actualizar
   * @param {Appointment} payload - Datos actualizados del turno
   * @returns {Promise<Appointment>} Turno actualizado
   * @throws {Error} Si la fecha es pasada (para nuevos turnos)
   */
  const updateAppointment = async (id, payload) => {
    try {
      // Solo validar fecha futura si se está creando un nuevo turno, no al cambiar estado
      if (payload.isNewAppointment && !isFuture(payload.datetime)) {
        throw new Error('Fecha pasada');
      }
      
      // Simular actualización en lugar de llamar a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Actualizar directamente en el estado local
      setAppointments((prev) => prev.map((t) => (t.id === id ? payload : t)));
      toast.success('Turno actualizado');
      return payload;
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Error al actualizar el turno');
      toast.error('Error al actualizar el turno');
      throw err;
    }
  };

  /**
   * Elimina un turno por ID.
   * Llama a API y actualiza estado local.
   *
   * @param {number} id - ID del turno a eliminar
   * @returns {Promise<void>} Turno eliminado del estado
   * @throws {Error} Si falla la API
   */
  const deleteAppointment = async (id) => {
    try {
      await backendAPI.delete(`/turnos/${id}`);
      setAppointments((prev) => prev.filter((t) => t.id !== id));
      toast.success('Turno eliminado');
    } catch (err) {
      // Manejo silencioso de 401 (el interceptor ya redirige al login)
      if (err.response?.status !== 401) {
        console.error('Error deleting appointment:', err);
        setError('Error al eliminar el turno');
        toast.error('Error al eliminar el turno');
      }
      throw err;
    }
  };

  useEffect(() => {
    // Solo fetch appointments si existe un token válido
    const token = localStorage.getItem('token');
    if (token) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      appointments,
      loading,
      error,
      fetchAppointments,
      createAppointment,
      updateAppointment,
      deleteAppointment,
    }),
    [appointments, loading, error]
  );

  return <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>;
};

export default AppointmentProvider;


