import React, { useContext, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AppointmentContext } from '../../context/AppointmentContext.jsx';
import Swal from 'sweetalert2';

const statusToBadge = (status) => {
  const map = {
    Pendiente: 'bg-blue-100 text-blue-700',
    Confirmado: 'bg-green-100 text-green-700',
    Cancelado: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

const AppointmentDetail = () => {
  const { id } = useParams();
  const { appointments, deleteAppointment, updateAppointment } = useContext(AppointmentContext);
  const navigate = useNavigate();
  const appt = useMemo(() => appointments.find((a) => (a.id === id || a._id === id)), [appointments, id]);
  const [notes, setNotes] = useState(appt?.notes || '');

  if (!appt) return null;
  const realId = appt.id || appt._id;

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
      await deleteAppointment(realId);
      navigate('/turnos');
    }
  };

  const onSendReminder = async () => {
    await Swal.fire({
      title: 'Recordatorio enviado',
      text: `Se envió recordatorio a ${appt.email}`,
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
      await updateAppointment(realId, { ...appt, status: 'Confirmado' });
    }
  };

  const onSaveNotes = async () => {
    await updateAppointment(realId, { ...appt, notes });
    await Swal.fire({ title: 'Notas guardadas', icon: 'success', confirmButtonColor: '#2563eb' });
  };

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-700">Detalle del turno</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusToBadge(appt.status)}`}>{appt.status}</span>
        </div>
        <div className="mt-4 space-y-2 text-gray-700">
          <p><strong>Paciente:</strong> {appt.patientName}</p>
          <p><strong>Email:</strong> {appt.email}</p>
          {appt.phone && <p><strong>Teléfono:</strong> {appt.phone}</p>}
          {appt.professional && <p><strong>Profesional:</strong> {appt.professional}</p>}
          <p><strong>Fecha y hora:</strong> {appt.datetime}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to={`/turnos/${realId}/edit`} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Editar</Link>
          <button onClick={onDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white">Eliminar</button>
          <button onClick={onSendReminder} className="px-4 py-2 rounded-lg border">Enviar recordatorio</button>
          <a href={`https://wa.me/?text=Hola%20${encodeURIComponent(appt.patientName)}%2C%20tu%20turno%20es%20${encodeURIComponent(appt.datetime)}.`} className="px-4 py-2 rounded-lg border">WhatsApp</a>
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


