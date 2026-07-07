import React, { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { useTurnero } from '../hooks/useTurnosContext';
import { useUser } from '../context/UserContext';

const ESPECIALIDADES = ['TOCOGINECOLOGÍA','CLÍNICA MÉDICA','NUTRICIÓN','PSICOLOGÍA'];
const PROFESIONALES = [
  { id:'p1', nombre:'ARRASCAETA FERNANDA BEATRIZ', especialidad:'TOCOGINECOLOGÍA', mutual:'OSEP CATAMARCA', sanatorio:'Sanatorio Centro' },
  { id:'p2', nombre:'MOLINA NATALIA', especialidad:'CLÍNICA MÉDICA', mutual:'OSDE', sanatorio:'Clínica Norte' },
];

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

const Turnero = () => {
  const { user } = useUser();
  const { crearTurno, loading, error, clearError } = useTurnero();
  
  const [especialidad, setEspecialidad] = useState('');
  const [prof, setProf] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const slots = useMemo(buildNextSlots, []);

  const profesionalesFiltrados = useMemo(()=> PROFESIONALES.filter(p=> !especialidad || p.especialidad===especialidad), [especialidad]);
  const firstSlot = slots[0];

  const onPay = async () => {
    try {
      // Verificar que el usuario esté logueado
      if (!user) {
        await Swal.fire({ 
          icon: 'warning', 
          title: 'Debes iniciar sesión', 
          text: 'Necesitas estar logueado para solicitar turnos' 
        });
        return;
      }

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
        
        // Crear el turno usando el contexto
        const turnoData = {
          pacienteId: user.id,
          profesionalId: prof,
          fecha: selectedSlot.toISOString().split('T')[0],
          hora: selectedSlot.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
          especialidad: especialidad,
          estado: 'confirmado'
        };
        
        const success = crearTurno(turnoData);
        
        if (success) {
          await Swal.fire({ 
            icon:'success', 
            title:'Turno solicitado', 
            text:'Se notificó al profesional y se guardó en el sistema.' 
          });
          
          // Limpiar formulario
          setEspecialidad('');
          setProf('');
          setSelectedSlot(null);
        } else {
          throw new Error('Error al crear el turno');
        }
      }
    } catch (error) {
      console.error('Error al crear turno:', error);
      await Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: error.message || 'Error al crear el turno' 
      });
    }
  };

  return (
    <div className="py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Solicitar nuevo turno</h1>
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
          <select value={especialidad} onChange={(e)=>setEspecialidad(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="">Seleccionar</option>
            {ESPECIALIDADES.map(e=> (<option key={e}>{e}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profesional</label>
          <select value={prof} onChange={(e)=>setProf(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="">Seleccionar</option>
            {profesionalesFiltrados.map(p=> (<option key={p.id} value={p.id}>{p.nombre} · Mutual: {p.mutual}</option>))}
          </select>
        </div>
        {prof && (
          <div className="bg-blue-50 rounded-lg p-3 text-blue-800">
            Primer turno libre: <strong>{firstSlot.toLocaleString()}</strong> · Sanatorio: {PROFESIONALES.find(p=>p.id===prof)?.sanatorio}
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-xs underline mt-1"
            >
              Cerrar
            </button>
          </div>
        )}
        
        <div className="text-right">
          <button 
            disabled={!selectedSlot || !prof || loading} 
            onClick={onPay} 
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              'Solicitar turno'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Turnero;



