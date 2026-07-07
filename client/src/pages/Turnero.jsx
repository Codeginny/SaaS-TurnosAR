import React, { useMemo, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { backendAPI } from '../api/axiosInstance';

/**
 * @typedef {Object} Profesional
 * @property {string} id - ID único del profesional
 * @property {string} nombre - Nombre completo del profesional
 * @property {string} especialidad - Especialidad médica
 * @property {string} mutual - Mutual/Obra social
 * @property {string} sanatorio - Sanatorio donde atiende
 * @property {string} provincia - Provincia donde atiende
 * @property {string} ciudad - Ciudad donde atiende
 */

/**
 * Genera array de slots horarios para los próximos 7 días.
 * Horarios disponibles: 9:00, 11:00, 14:00, 16:00 cada día.
 * Total: 28 slots (7 días x 4 horarios).
 *
 * @returns {Array<Date>} Array de objetos Date con horarios disponibles
 */
const buildNextSlots = () => {
  const slots = [];
  const base = new Date();
  for (let d=1; d<=7; d++) {
    const day = new Date(base);
    day.setDate(base.getDate()+d);
    [9,11,14,16].forEach(h=>{
      const s = new Date(day);
      s.setHours(h); s.setMinutes(0); s.setSeconds(0);
      slots.push(s);
    });
  }
  return slots;
};

/**
 * Componente de solicitud de turnos médicos.
 * Permite seleccionar especialidad, profesional, horario y simular pago.
 *
 * Características:
 * - Filtro de profesionales por especialidad
 * - Selección de horarios de los próximos 7 días
 * - Simulación de pago con tarjeta
 * - Notificaciones con SweetAlert2
 * - Datos mock para desarrollo
 *
 * @returns {JSX.Element} Formulario de solicitud de turnos
 */
const Turnero = () => {
  const [especialidad, setEspecialidad] = useState('');
  const [provincia, setProvincia] = useState('');
  const [clinica, setClinica] = useState('');
  const [prof, setProf] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [profesionales, setProfesionales] = useState([]);
  const slots = useMemo(buildNextSlots, []);

  console.log('🔄 Turnero renderizado - Profesionales cargados:', profesionales.length);

  /**
   * Extrae especialidades únicas de los profesionales cargados.
 * Garantiza que solo se muestren especialidades con profesionales activos.
 *
 * @returns {Array<string>} Lista de especialidades únicas
 */
  const especialidadesUnicas = useMemo(() => {
    return [...new Set(profesionales.map(p => p.especialidad))].sort();
  }, [profesionales]);

  /**
   * Extrae provincias únicas de los profesionales cargados.
   * Garantiza que solo se muestren provincias con profesionales activos.
   * Excluye profesionales sin provincia cargada.
   *
   * @returns {Array<string>} Lista de provincias únicas
   */
  const provinciasUnicas = useMemo(() => {
    return [...new Set(profesionales
      .filter(p => p.provincia && p.provincia.trim() !== '')
      .map(p => p.provincia)
    )].sort();
  }, [profesionales]);

  /**
   * Extrae clínicas únicas de los profesionales cargados.
 * Si se seleccionó una provincia, filtra por esa provincia.
 * Si se seleccionó una especialidad, filtra por esa especialidad.
 * 
 * **Lógica de filtrado en cascada:**
 * - Sin filtros: todas las clínicas
 * - Con provincia: clínicas en esa provincia
 * - Con especialidad: clínicas con médicos de esa especialidad
 * - Con ambos: clínicas en provincia con médicos de esa especialidad
 *
 * @returns {Array<string>} Lista de clínicas únicas filtradas
 */
  const clinicasUnicas = useMemo(() => {
    let filtrados = profesionales;
    if (provincia) {
      filtrados = filtrados.filter(p => p.provincia === provincia);
    }
    if (especialidad) {
      filtrados = filtrados.filter(p => p.especialidad === especialidad);
    }
    return [...new Set(filtrados.map(p => p.sanatorio).filter(Boolean))].sort();
  }, [profesionales, provincia, especialidad]);

  /**
   * Carga la lista de profesionales desde PostgreSQL mediante API.
 * Los profesionales se obtienen del endpoint /api/profesionales.
 *
 * @returns {Promise<void>} Actualiza estado profesionales
 */
  const fetchProfesionales = async () => {
    console.log('🚀 Iniciando fetchProfesionales...');
    try {
      const response = await backendAPI.get('/profesionales');
      console.log('📊 Profesionales en crudo:', response.data);
      console.log('📍 Provincias disponibles en los datos:', [...new Set(response.data.map(p => p.provincia))]);
      // Transformar datos de la API al formato esperado por el componente
      const profesionalesTransformados = response.data.map(p => ({
        id: p.id.toString(),
        nombre: p.nombre,
        especialidad: p.especialidad,
        mutual: 'OSDE', // Valor por defecto, se puede obtener de la DB si está disponible
        sanatorio: p.clinica || 'Sanatorio Centro', // Usar clinica de la DB
        provincia: p.provincia || null, // Provincia para filtros
        ciudad: p.ciudad || null // Ciudad para filtros
      }));
      console.log('✅ Profesionales transformados:', profesionalesTransformados);
      setProfesionales(profesionalesTransformados);
    } catch (error) {
      console.error('❌ Error al cargar profesionales:', error);
      setProfesionales([]); // Fallback: array vacío si la API falla
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la lista de profesionales. Por favor, intenta nuevamente más tarde.'
      });
    }
  };

  useEffect(() => {
    fetchProfesionales();
  }, []);

  /**
   * Reset de filtros en cascada.
 * Cuando cambia un filtro superior, resetea los inferiores para mantener consistencia.
 */
  useEffect(() => {
    if (provincia) {
      setClinica('');
      setProf('');
    }
  }, [provincia]);

  useEffect(() => {
    if (clinica) {
      setProf('');
    }
  }, [clinica]);

  useEffect(() => {
    if (especialidad) {
      setProf('');
    }
  }, [especialidad]);

  /**
   * Filtra profesionales según selección del usuario.
   * 
   * **Lógica de filtrado en cascada:**
   * - Excluye profesionales sin provincia cargada
   * - Si hay provincia: filtra por provincia (case-insensitive, trim)
   * - Si hay clínica: filtra por clínica (case-insensitive, trim)
   * - Si hay especialidad: filtra por especialidad (case-insensitive, trim)
   * - Los filtros se aplican en conjunto (AND lógico)
   * 
   * Garantiza integridad entre oferta médica y selección del paciente.
   *
   * @returns {Array<Profesional>} Lista de profesionales filtrados
   */
  const profesionalesFiltrados = useMemo(() => {
    console.log('🔍 DEBUG FILTRO - Provincia seleccionada:', provincia);
    console.log('🔍 DEBUG FILTRO - Clínica seleccionada:', clinica);
    console.log('🔍 DEBUG FILTRO - Especialidad seleccionada:', especialidad);
    console.log('🔍 DEBUG FILTRO - Total profesionales:', profesionales.length);
    
    const filtrados = profesionales.filter(p => {
      // Excluir profesionales sin provincia cargada
      if (!p.provincia || p.provincia.trim() === '') {
        console.log('❌ Profesional sin provincia:', p);
        return false;
      }
      
      // Filtro case-insensitive con trim para provincia
      if (provincia && p.provincia.trim().toLowerCase() !== provincia.trim().toLowerCase()) {
        console.log('❌ Profesional filtrado por provincia:', p.provincia, '!=', provincia);
        return false;
      }
      
      // Filtro case-insensitive con trim para clínica
      if (clinica && p.sanatorio && p.sanatorio.trim().toLowerCase() !== clinica.trim().toLowerCase()) {
        console.log('❌ Profesional filtrado por clínica:', p.sanatorio, '!=', clinica);
        return false;
      }
      
      // Filtro case-insensitive con trim para especialidad
      if (especialidad && p.especialidad.trim().toLowerCase() !== especialidad.trim().toLowerCase()) {
        console.log('❌ Profesional filtrado por especialidad:', p.especialidad, '!=', especialidad);
        return false;
      }
      
      console.log('✅ Profesional pasó filtros:', p);
      return true;
    });
    
    console.log('🔍 DEBUG FILTRO - Profesionales filtrados:', filtrados.length);
    return filtrados;
  }, [profesionales, provincia, clinica, especialidad]);
  const firstSlot = slots[0];

  /**
   * Simula proceso de pago con tarjeta de crédito.
 * Muestra modal de SweetAlert2 para ingresar datos de tarjeta.
 * Valida formato: número (13-19 dígitos), expiración (MM/AA), CVV (3-4 dígitos).
 *
 * @returns {Promise<void>} Muestra notificaciones de éxito
 */
  const onPay = async () => {
    const card = await Swal.fire({
      title: 'Pago online (simulado)',
      html: '<input id="card" class="swal2-input" placeholder="Número de tarjeta" />\
             <input id="exp" class="swal2-input" placeholder="MM/AA" />\
             <input id="cvv" class="swal2-input" placeholder="CVV" />',
      focusConfirm: false,
      preConfirm: () => {
        const num = document.getElementById('card').value || '';
        const exp = document.getElementById('exp').value || '';
        const cvv = document.getElementById('cvv').value || '';
        if (!/^\d{13,19}$/.test(num) || !/^\d{2}\/\d{2}$/.test(exp) || !/^\d{3,4}$/.test(cvv)) {
          Swal.showValidationMessage('Datos de tarjeta inválidos');
          return false;
        }
        return { num, exp, cvv };
      },
      showCancelButton: true,
      confirmButtonText: 'Pagar',
      cancelButtonText: 'Cancelar',
    });
    if (card.isConfirmed) {
      await Swal.fire({ icon:'success', title:'Pago realizado con éxito' });
      await Swal.fire({ icon:'success', title:'Turno solicitado', text:'Se notificó al profesional.' });
    }
  };

  return (
    <div className="py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Solicitar nuevo turno</h1>
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
          <select value={provincia} onChange={(e)=>setProvincia(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="">Todas</option>
            {provinciasUnicas.map(p=> (<option key={p}>{p}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clínica o Consultorio</label>
          <select value={clinica} onChange={(e)=>setClinica(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="">Seleccionar</option>
            {clinicasUnicas.map(c=> (<option key={c}>{c}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
          <select value={especialidad} onChange={(e)=>setEspecialidad(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="">Todas</option>
            {especialidadesUnicas.map(e=> (<option key={e}>{e}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profesional</label>
          <select value={prof} onChange={(e)=>setProf(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="">Seleccionar</option>
            {profesionalesFiltrados.length > 0 ? (
              profesionalesFiltrados.map(p=> (<option key={p.id} value={p.id}>{p.nombre} - {p.especialidad}</option>))
            ) : (
              <option disabled>No hay profesionales en esta ubicación</option>
            )}
          </select>
        </div>
        {prof && (
          <div className="bg-blue-50 rounded-lg p-3 text-blue-800">
            <div>Primer turno libre: <strong>{firstSlot.toLocaleString()}</strong></div>
            <div>Sanatorio: {profesionales.find(p=>p.id===prof)?.sanatorio}</div>
            <div>Provincia: {profesionales.find(p=>p.id===prof)?.provincia}</div>
            <div>Ciudad: {profesionales.find(p=>p.id===prof)?.ciudad}</div>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-blue-700 mb-2">Días disponibles</h3>
          <div className="grid md:grid-cols-4 gap-2">
            {slots.slice(0,12).map(s=> (
              <button key={s.toISOString()} onClick={()=>setSelectedSlot(s)} className={`px-3 py-2 rounded-lg border ${selectedSlot===s ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}>
                {s.toLocaleDateString()} {s.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
              </button>
            ))}
          </div>
        </div>
        <div className="text-right">
          <button disabled={!selectedSlot || !prof} onClick={onPay} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">Solicitar turno</button>
        </div>
      </div>
    </div>
  );
};

export default Turnero;



