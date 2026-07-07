import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTurnosContext } from '../../hooks/useTurnosContext';
import Swal from 'sweetalert2';

const statusToBadge = (status) => {
  const map = {
    pendiente: 'bg-blue-100 text-blue-700',
    confirmado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

const AppointmentDetail = () => {
  const { id } = useParams();
  const { turnos, deleteTurno, updateTurno } = useTurnosContext();
  const navigate = useNavigate();
  const turno = useMemo(() => turnos.find((t) => t.id === id), [turnos, id]);
  const [notes, setNotes] = useState(turno?.notas || '');

  if (!turno) return null;
  const realId = turno.id;

  const onDelete = async () => {
    const result = await Swal.fire({
      title: 'Eliminar turno',
      text: '¿Seguro que deseas eliminar este turno?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      await deleteTurno(realId);
      navigate('/turnos');
    }
  };

  const onSendReminder = async () => {
          await Swal.fire({
        title: 'Recordatorio enviado',
        text: `Se envió recordatorio a ${turno.pacienteEmail || 'el paciente'}`,
        icon: 'success',
        confirmButtonColor: '#2563eb',
      });
  };

  const onPay = async () => {
    const result = await Swal.fire({
      title: 'Pagar turno',
      text: '¿Confirmás el pago?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Pagar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
    });
    if (result.isConfirmed) {
      await updateTurno(realId, { ...turno, estado: 'confirmado' });
    }
  };

  const onSaveNotes = async () => {
    await updateTurno(realId, { ...turno, notas: notes });
    await Swal.fire({ title: 'Notas guardadas', icon: 'success', confirmButtonColor: '#2563eb' });
  };

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-700">Detalle del turno</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusToBadge(turno.estado)}`}>{turno.estado}</span>
        </div>
        <div className="mt-4 space-y-2 text-gray-700">
          <p><strong>Paciente:</strong> {turno.pacienteNombre || 'Paciente'}</p>
          <p><strong>Email:</strong> {turno.pacienteEmail || 'Sin email'}</p>
          {turno.pacienteTelefono && <p><strong>Teléfono:</strong> {turno.pacienteTelefono}</p>}
          {turno.profesionalNombre && <p><strong>Profesional:</strong> {turno.profesionalNombre}</p>}
          <p><strong>Fecha y hora:</strong> {turno.fecha} - {turno.hora}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to={`/turnos/${realId}/edit`} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Editar</Link>
          <button onClick={onDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white">Eliminar</button>
          <button onClick={onSendReminder} className="px-4 py-2 rounded-lg border">Enviar recordatorio</button>
          <a href={`https://wa.me/?text=Hola%20${encodeURIComponent(turno.pacienteNombre || 'Paciente')}%2C%20tu%20turno%20es%20${encodeURIComponent(`${turno.fecha} - ${turno.hora}`)}.`} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border">WhatsApp</a>
          <button onClick={onPay} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Pagar turno</button>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Ficha clínica (notas)</h3>
          <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className="w-full min-h-[120px] border rounded-lg p-3" placeholder="Agregar notas..." />
          <div className="mt-2 text-right">
            <button onClick={onSaveNotes} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Guardar notas</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;


