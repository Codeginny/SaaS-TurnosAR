import React, { useContext, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppointmentContext } from '../../context/AppointmentContext.jsx';
import { Calendar, User, Plus, Trash2, PencilLine, Search } from 'lucide-react';
import Swal from 'sweetalert2';

const statusToBadge = (status) => {
  const map = {
    Pendiente: 'bg-blue-100 text-blue-700',
    Confirmado: 'bg-green-100 text-green-700',
    Cancelado: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

const formatDatetime = (dt) => {
  if (!dt) return '';
  try {
    const cleanDt = dt.replace('T', ' ');
    const [datePart, timePart] = cleanDt.split(' ');
    if (!datePart) return dt;
    const [year, month, day] = datePart.split('-');
    const time = timePart ? timePart.substring(0, 5) : '';
    return time ? `${day}/${month}/${year} - ${time} hs` : `${day}/${month}/${year}`;
  } catch (e) {
    return dt;
  }
};

const AppointmentList = () => {
  const { appointments, deleteAppointment, loading } = useContext(AppointmentContext);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return appointments.filter((a) => {
      const matchesQuery = (a.patientName || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter ? a.status === statusFilter : true;
      const matchesDate = dateFilter ? (a.datetime || '').startsWith(dateFilter) : true;
      return matchesQuery && matchesStatus && matchesDate;
    });
  }, [appointments, query, statusFilter, dateFilter]);

  const onDelete = async (id) => {
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
      await deleteAppointment(id);
    }
  };

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <Calendar size={28} /> Turnos
        </h1>
        <button onClick={() => navigate('/turnos/create')} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow">
          <Plus size={18} /> Nuevo turno
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre de paciente" className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-300 transition-colors" />
          <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl transition-colors">
          <option value="">Todos los estados</option>
          <option>Pendiente</option>
          <option>Confirmado</option>
          <option>Cancelado</option>
        </select>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl transition-colors" />
      </div>

      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-400">Cargando turnos...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">No hay turnos</p>
      ) : (
        <>
          <div className="overflow-x-auto w-full bg-white dark:bg-slate-800 rounded-xl shadow transition-colors">
            <table className="min-w-full">
              <thead className="bg-blue-50 dark:bg-slate-700 text-blue-800 dark:text-blue-300">
                <tr>
                  <th className="text-left p-3">Paciente</th>
                  <th className="text-left p-3">Contacto</th>
                  <th className="text-left p-3">Fecha y hora</th>
                  <th className="text-left p-3">Estado</th>

                </tr>
              </thead>
              <tbody className="text-gray-900 dark:text-gray-200">
                {filtered.map((a) => {
                  const id = a.id || a._id;
                  return (
                    <tr key={id} className="border-b border-gray-200 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors">
                      <td className="p-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{a.patientName}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{a.contact}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatDatetime(a.datetime)}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusToBadge(a.status)}`}>{a.status}</span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-3">Agenda semanal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((d, idx) => (
                <div key={d} className="bg-white rounded-xl shadow p-3">
                  <h3 className="text-blue-700 font-medium mb-2">{d}</h3>
                  <div className="space-y-2">
                    {filtered.filter((a)=>{
                      if (!a.datetime) return false;
                      const day = new Date(a.datetime).getDay();
                      // getDay: 0 Dom ... 6 Sáb. Convertimos idx (0 Lun) a real.
                      const mapIdxToGetDay = [1,2,3,4,5,6,0];
                      return day === mapIdxToGetDay[idx];
                    }).slice(0,4).map((a)=> (
                      <Link key={(a.id||a._id)} to={`/turnos/${a.id||a._id}`} className={`block text-xs px-2 py-1 rounded ${statusToBadge(a.status)}`}>
                        {new Date(a.datetime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} · {a.patientName}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AppointmentList;


