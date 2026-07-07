import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppointmentContext } from '../../context/AppointmentContext.jsx';

const AppointmentEdit = () => {
  const { id } = useParams();
  const { appointments, updateAppointment } = useContext(AppointmentContext);
  const navigate = useNavigate();
  const current = useMemo(() => appointments.find((a) => (a.id === id || a._id === id)), [appointments, id]);
  const [form, setForm] = useState(current || { patientName: '', email: '', phone: '', professional: 'Dr. General', datetime: '', status: 'Pendiente' });

  useEffect(() => {
    if (current) setForm(current);
  }, [current]);

  if (!current) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const realId = current.id || current._id;
    await updateAppointment(realId, form);
    navigate('/turnos');
  };

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Editar turno</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del paciente</label>
            <input name="patientName" value={form.patientName || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" value={form.email || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300" required />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input name="phone" value={form.phone || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profesional</label>
              <input name="professional" value={form.professional || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
            <input type="datetime-local" name="datetime" value={form.datetime || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
              <option>Pendiente</option>
              <option>Confirmado</option>
              <option>Cancelado</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => navigate('/turnos')} className="px-4 py-2 rounded-lg border">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentEdit;



