import React, { useContext, useMemo, useState } from 'react';
import { AppointmentContext } from '../../context/AppointmentContext.jsx';

const PatientAppointments = () => {
  const { appointments } = useContext(AppointmentContext);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const filtered = useMemo(()=> {
    const query = q.toLowerCase();
    return appointments.filter(a =>
      (!status || a.status === status) &&
      (!query || (a.patientName||'').toLowerCase().includes(query) || (a.reason||'').toLowerCase().includes(query))
    );
  }, [appointments, q, status]);

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
        {filtered.map((a)=> (
          <div key={(a.id||a._id)} className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold text-blue-700">{a.reason || 'Consulta'}</div>
            <div className="text-gray-700">{a.datetime}</div>
            <div className="text-sm text-gray-500">Estado: {a.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientAppointments;



