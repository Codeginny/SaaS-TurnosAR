import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTurnosContext } from '../../hooks/useTurnosContext';

const AppointmentEdit = () => {
  const { id } = useParams();
  const { turnos, updateTurno } = useTurnosContext();
  const navigate = useNavigate();
  const current = useMemo(() => turnos.find((t) => t.id === id), [turnos, id]);
  const [form, setForm] = useState(current || { pacienteNombre: '', pacienteEmail: '', pacienteTelefono: '', profesionalNombre: 'Dr. General', fecha: '', hora: '', estado: 'pendiente' });

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
    const realId = current.id;
    await updateTurno(realId, form);
    navigate('/turnos');
  };

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Editar turno</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del paciente</label>
            <input name="pacienteNombre" value={form.pacienteNombre || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="pacienteEmail" value={form.pacienteEmail || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300" required />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input name="pacienteTelefono" value={form.pacienteTelefono || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profesional</label>
              <input name="profesionalNombre" value={form.profesionalNombre || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input type="date" name="fecha" value={form.fecha || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input type="time" name="hora" value={form.hora || ''} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
              <option>pendiente</option>
              <option>confirmado</option>
              <option>cancelado</option>
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



