import React, { useMemo, useState } from 'react';
import { useTurnosPaciente } from '../../hooks/useTurnosContext';

const PatientAppointments = () => {
  const { turnosPaciente } = useTurnosPaciente();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const filtered = useMemo(()=> {
    const query = q.toLowerCase();
    return turnosPaciente.filter(turno =>
      (!status || turno.estado === status) &&
      (!query || (turno.profesionalNombre||'').toLowerCase().includes(query) || (turno.especialidad||'').toLowerCase().includes(query))
    );
  }, [turnosPaciente, q, status]);

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Mis turnos</h1>
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar por profesional/especialidad" className="border rounded-lg px-3 py-2" />
        <select value={status} onChange={(e)=>setStatus(e.target.value)} className="border rounded-lg px-3 py-2">
          <option value="">Todos</option>
          <option>Pendiente</option>
          <option>Confirmado</option>
          <option>Cancelado</option>
        </select>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((turno)=> (
          <div key={turno.id} className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold text-blue-700">{turno.especialidad || 'Consulta'}</div>
            <div className="text-gray-700">{turno.fecha} - {turno.hora}</div>
            <div className="text-sm text-gray-500">Estado: {turno.estado}</div>
            <div className="text-sm text-gray-500">Profesional: {turno.profesionalNombre}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientAppointments;



