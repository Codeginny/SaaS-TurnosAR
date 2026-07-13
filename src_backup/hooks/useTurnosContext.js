import { useTurnos, useTurnosStats, useTurnosSearch } from '../context/TurnosContext';

// Hook principal que expone todo el contexto
export const useTurnosContext = () => {
  return useTurnos();
};

// Hook para componentes que solo necesitan estadísticas
export const useTurnosEstadisticas = () => {
  return useTurnosStats();
};

// Hook para componentes que solo necesitan búsquedas
export const useTurnosBusqueda = () => {
  return useTurnosSearch();
};

// Hook específico para el dashboard del paciente
export const useTurnosPaciente = (pacienteId) => {
  const { 
    getTurnosByPaciente, 
    updateTurno, 
    deleteTurno,
    loading,
    error 
  } = useTurnos();
  
  const turnosDelPaciente = getTurnosByPaciente(pacienteId);
  
  const cancelarTurno = (turnoId) => {
    return updateTurno(turnoId, { estado: 'cancelado' });
  };
  
  const confirmarTurno = (turnoId) => {
    return updateTurno(turnoId, { estado: 'confirmado' });
  };
  
  const completarTurno = (turnoId) => {
    return updateTurno(turnoId, { estado: 'completado' });
  };
  
  return {
    turnos: turnosDelPaciente,
    cancelarTurno,
    confirmarTurno,
    completarTurno,
    loading,
    error,
    hasTurnos: turnosDelPaciente.length > 0,
    turnosCount: turnosDelPaciente.length
  };
};

// Hook específico para el dashboard del profesional
export const useTurnosProfesional = (profesionalId) => {
  const { 
    getTurnosByProfesional, 
    updateTurno, 
    deleteTurno,
    estadisticas,
    loading,
    error 
  } = useTurnos();
  
  const turnosDelProfesional = getTurnosByProfesional(profesionalId);
  
  const confirmarTurno = (turnoId) => {
    return updateTurno(turnoId, { estado: 'confirmado' });
  };
  
  const cancelarTurno = (turnoId) => {
    return updateTurno(turnoId, { estado: 'cancelado' });
  };
  
  const completarTurno = (turnoId) => {
    return updateTurno(turnoId, { estado: 'completado' });
  };
  
  const reprogramarTurno = (turnoId, nuevaFecha, nuevaHora) => {
    return updateTurno(turnoId, { 
      fecha: nuevaFecha, 
      hora: nuevaHora,
      updatedAt: Date.now()
    });
  };
  
  // Estadísticas específicas del profesional
  const estadisticasProfesional = {
    total: turnosDelProfesional.length,
    confirmados: turnosDelProfesional.filter(t => t.estado === 'confirmado').length,
    cancelados: turnosDelProfesional.filter(t => t.estado === 'cancelado').length,
    completados: turnosDelProfesional.filter(t => t.estado === 'completado').length,
    hoy: turnosDelProfesional.filter(t => {
      const hoy = new Date().toISOString().split('T')[0];
      return t.fecha === hoy && t.estado === 'confirmado';
    }).length
  };
  
  return {
    turnos: turnosDelProfesional,
    estadisticas: estadisticasProfesional,
    confirmarTurno,
    cancelarTurno,
    completarTurno,
    reprogramarTurno,
    loading,
    error,
    hasTurnos: turnosDelProfesional.length > 0,
    turnosCount: turnosDelProfesional.length
  };
};

// Hook para el turnero (creación de turnos)
export const useTurnero = () => {
  const { 
    addTurno, 
    verificarConflictos,
    getTurnosByFecha,
    loading,
    error,
    clearError 
  } = useTurnos();
  
  const crearTurno = (datosTurno) => {
    // Verificar conflictos antes de crear
    const hayConflicto = verificarConflictos(
      datosTurno.profesionalId,
      datosTurno.fecha,
      datosTurno.hora
    );
    
    if (hayConflicto) {
      throw new Error('Ya existe un turno en ese horario para este profesional');
    }
    
    return addTurno(datosTurno);
  };
  
  const getTurnosDisponibles = (fecha, profesionalId) => {
    const turnosDelDia = getTurnosByFecha(fecha);
    const turnosDelProfesional = turnosDelProfesional.filter(t => 
      t.profesionalId === profesionalId
    );
    
    // Aquí podrías implementar lógica para determinar horarios disponibles
    return turnosDelProfesional;
  };
  
  return {
    crearTurno,
    getTurnosDisponibles,
    verificarConflictos,
    loading,
    error,
    clearError
  };
};

// Hook para notificaciones de turnos
export const useTurnosNotificaciones = () => {
  const { turnosProximos, estadisticas } = useTurnos();
  
  const notificacionesTurnos = turnosProximos.map(turno => ({
    id: turno.id,
    tipo: 'turno_proximo',
    mensaje: `Tienes un turno ${turno.fecha} a las ${turno.hora}`,
    fecha: turno.fecha,
    hora: turno.hora,
    prioridad: 'alta'
  }));
  
  return {
    notificaciones: notificacionesTurnos,
    count: notificacionesTurnos.length,
    hasNotificaciones: notificacionesTurnos.length > 0
  };
};

export default useTurnosContext;
