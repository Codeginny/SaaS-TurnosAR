import React, { useState } from 'react';

const FreeTrial = () => {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [greet, setGreet] = useState(localStorage.getItem('mp_patient_name') || '');

  const onSubmit = (e) => {
    e.preventDefault();
    const name = 'VIRGINIA ALEJANDRA PONCE';
    localStorage.setItem('mp_patient_name', name);
    setGreet(`Hola, ${name}!`);
  };

  return (
    <div className="py-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">Soy paciente</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-blue-700 mb-2">Mis Turnos Móvil</h2>
        <p className="text-gray-700">Turnero Web para pacientes</p>
        <p className="text-gray-700 mt-2">Si sos paciente registrado en alguna de las clínicas asociadas, ingresa tu DNI para iniciar sesión.</p>
        <form onSubmit={onSubmit} className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">N° Documento</label>
            <input value={dni} onChange={(e)=>setDni(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <p className="md:col-span-2 text-sm text-gray-600">¿Es la primera vez que ingresas? Ingresa tu DNI como contraseña. Luego deberás cambiarla.</p>
          <button className="md:col-span-2 rounded-lg bg-blue-600 text-white py-2">Ingresar</button>
          <div className="md:col-span-2 flex justify-between text-sm text-blue-700">
            <a href="#">¿Olvidaste tu contraseña?</a>
            <a href="#">¿No sos paciente aún? Registrate</a>
          </div>
        </form>
        {greet && <div className="mt-4 p-3 rounded bg-blue-50 text-blue-800">{greet}</div>}
        <div className="mt-4 flex gap-3">
          <a href="/turnero" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Pedir turno</a>
          <a href="/mis-turnos" className="px-4 py-2 rounded-lg border">Mis turnos</a>
        </div>
      </div>
    </div>
  );
};

export default FreeTrial;


