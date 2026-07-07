import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const TurnosContext = createContext();

export const useTurnos = () => {
  const context = useContext(TurnosContext);
  if (!context) {
    throw new Error('useTurnos debe ser usado dentro de TurnosProvider');
  }
  return context;
};

export const TurnosProvider = ({ children }) => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addTurno = useCallback((turno) => {
    const newTurno = {
      id: `turno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...turno,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      estado: turno.estado || 'pendiente'
    };
    setTurnos(prev => [...prev, newTurno]);
    return true;
  }, []);

  const updateTurno = useCallback((id, updates) => {
    setTurnos(prev => prev.map(turno => 
      turno.id === id 
        ? { ...turno, ...updates, updatedAt: Date.now() }
        : turno
    ));
  }, []);

  const deleteTurno = useCallback((id) => {
    setTurnos(prev => prev.filter(turno => turno.id !== id));
  }, []);

  const getTurnosByPaciente = useCallback((pacienteId) => {
    return turnos.filter(turno => turno.pacienteId === pacienteId);
  }, [turnos]);

  const getTurnosByProfesional = useCallback((profesionalId) => {
    return turnos.filter(turno => turno.profesionalId === profesionalId);
  }, [turnos]);

  const getTurnosByFecha = useCallback((fecha) => {
    return turnos.filter(turno => turno.fecha === fecha);
  }, [turnos]);

  const getTurnosByEstado = useCallback((estado) => {
    return turnos.filter(turno => turno.estado === estado);
  }, [turnos]);

  const getTurnoById = useCallback((id) => {
    return turnos.find(turno => turno.id === id);
  }, [turnos]);

  const estadisticas = useMemo(() => {
    const totalTurnos = turnos.length;
    const turnosCompletados = turnos.filter(t => t.estado === 'completado').length;
    const turnosPendientes = turnos.filter(t => t.estado === 'pendiente').length;
    const turnosCancelados = turnos.filter(t => t.estado === 'cancelado').length;

    const hoy = new Date().toISOString().split('T')[0];
    const turnosHoy = turnos.filter(t => t.fecha === hoy);

    const proximoTurno = turnos
      .filter(t => t.estado === 'pendiente' && t.fecha >= hoy)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];

    return {
      totalTurnos,
      turnosCompletados,
      turnosPendientes,
      turnosCancelados,
      turnosHoy,
      proximoTurno: proximoTurno ? `${proximoTurno.fecha} - ${proximoTurno.hora}` : null
    };
  }, [turnos]);

  const turnosProximos = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return turnos
      .filter(t => t.fecha >= hoy && t.estado === 'confirmado')
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(0, 5);
  }, [turnos]);

  const value = {
    turnos,
    loading,
    error,
    addTurno,
    updateTurno,
    deleteTurno,
    getTurnosByPaciente,
    getTurnosByProfesional,
    getTurnosByFecha,
    getTurnosByEstado,
    getTurnoById,
    estadisticas,
    turnosProximos,
    hasTurnos: turnos.length > 0,
    turnosCount: turnos.length
  };

  return (
    <TurnosContext.Provider value={value}>
      {children}
    </TurnosContext.Provider>
  );
};

export const useTurnosStats = () => {
  const { estadisticas, turnosProximos } = useTurnos();
  return { estadisticas, turnosProximos };
};

export const useTurnosSearch = () => {
  const { 
    getTurnosByPaciente, 
    getTurnosByProfesional, 
    getTurnosByFecha, 
    getTurnosByEstado,
    getTurnoById 
  } = useTurnos();
  
  return { 
    getTurnosByPaciente, 
    getTurnosByProfesional, 
    getTurnosByFecha, 
    getTurnosByEstado,
    getTurnoById 
  };
};

export default TurnosProvider;
