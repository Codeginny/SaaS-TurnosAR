import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTurnosContext } from '../../hooks/useTurnosContext';
import { Calendar, User, Plus, Trash2, PencilLine, Search } from 'lucide-react';
import Swal from 'sweetalert2';

const statusToBadge = (status) => {
  const map = {
    pendiente: 'bg-blue-100 text-blue-700',
    confirmado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

const AppointmentList = () => {
  const { turnos, deleteTurno, loading } = useTurnosContext();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return turnos.filter((turno) => {
      const matchesQuery = (turno.pacienteNombre || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter ? turno.estado === statusFilter : true;
      const matchesDate = dateFilter ? (turno.fecha || '').startsWith(dateFilter) : true;
      return matchesQuery && matchesStatus && matchesDate;
    });
  }, [turnos, query, statusFilter, dateFilter]);

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
      await deleteTurno(id);
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

      <div className="mb-4 grid md:grid-cols-3 gap-3">
        <div className="relative">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre de paciente" className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-300" />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border rounded-xl">
          <option value="">Todos los estados</option>
          <option>pendiente</option>
          <option>confirmado</option>
          <option>cancelado</option>
        </select>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Cargando turnos...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-600">No hay turnos</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full">
              <thead className="bg-blue-50 text-blue-800">
                <tr>
                  <th className="text-left p-3">Paciente</th>
                  <th className="text-left p-3">Contacto</th>
                  <th className="text-left p-3">Fecha y hora</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((turno) => {
                  const id = turno.id;
                  return (
                    <tr key={id} className="border-b last:border-0">
                      <td className="p-3 font-medium">{turno.pacienteNombre || 'Paciente'}</td>
                      <td className="p-3">{turno.pacienteTelefono || 'Sin teléfono'}</td>
                      <td className="p-3">{turno.fecha} - {turno.hora}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusToBadge(turno.estado)}`}>{turno.estado}</span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/turnos/${id}`} className="px-3 py-1 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50">Ver</Link>
                          <button onClick={() => navigate(`/turnos/${id}/edit`)} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"><PencilLine size={16} />Editar</button>
                          <button onClick={() => onDelete(id)} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"><Trash2 size={16} />Borrar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid md:hidden grid-cols-1 gap-4 mt-6">
            {filtered.map((turno) => {
              const id = turno.id;
              return (
                <div key={id} className="bg-white rounded-xl shadow p-4 transition hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="text-blue-600" size={18} />
                      <h3 className="font-semibold">{turno.pacienteNombre || 'Paciente'}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusToBadge(turno.estado)}`}>{turno.estado}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{turno.pacienteTelefono || 'Sin teléfono'}</p>
                  <p className="text-gray-600">{turno.fecha} - {turno.hora}</p>
                  <div className="mt-3 flex gap-2">
                    <Link to={`/turnos/${id}`} className="px-3 py-1 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 w-full text-center">Ver</Link>
                    <button onClick={() => navigate(`/turnos/${id}/edit`)} className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 w-full">Editar</button>
                    <button onClick={() => onDelete(id)} className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 w-full">Borrar</button>
                  </div>
                </div>
              );
            })}
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-3">Agenda semanal</h2>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
              {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((d, idx) => (
                <div key={d} className="bg-white rounded-xl shadow p-3">
                  <h3 className="text-blue-700 font-medium mb-2">{d}</h3>
                  <div className="space-y-2">
                    {filtered.filter((turno)=>{
                      if (!turno.fecha) return false;
                      const day = new Date(turno.fecha).getDay();
                      // getDay: 0 Dom ... 6 Sáb. Convertimos idx (0 Lun) a real.
                      const mapIdxToGetDay = [1,2,3,4,5,6,0];
                      return day === mapIdxToGetDay[idx];
                    }).slice(0,4).map((turno)=> (
                      <Link key={turno.id} to={`/turnos/${turno.id}`} className={`block text-xs px-2 py-1 rounded ${statusToBadge(turno.estado)}`}>
                        {turno.hora} · {turno.pacienteNombre || 'Paciente'}
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


