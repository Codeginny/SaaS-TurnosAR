import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentGateway from './PaymentGateway';

const tiers = [
  { 
    name: 'Estándar', 
    price: 'US$9/mes', 
    popular: false,
    features: ['Agenda básica', 'Recordatorios por email', 'Historial simple', 'Hasta 2 profesionales', 'Soporte por email'] 
  },
  { 
    name: 'Premium', 
    price: 'US$19/mes', 
    popular: true,
    features: ['Todo Estándar', 'Integración pagos', 'Recetas electrónicas', 'Página de turnos', 'Hasta 5 profesionales', 'Soporte prioritario'] 
  },
  { 
    name: 'Platino', 
    price: 'US$29/mes', 
    popular: false,
    features: ['Todo Premium', 'Telemedicina', 'Soporte 24/7', 'Múltiples profesionales', 'API personalizada', 'Onboarding dedicado'] 
  },
];

const benefits = [
  {
    title: "Mejore su productividad, comunicación y eficiencia en los procesos",
    description: "Automatice tareas administrativas y enfoque su tiempo en lo que realmente importa: sus pacientes."
  },
  {
    title: "Adapte su entidad a nuevas tecnologías y adquiera presencia digital",
    description: "Modernice su consultorio con herramientas digitales que sus pacientes esperan."
  },
  {
    title: "Transmita confianza y credibilidad a sus pacientes",
    description: "Una plataforma profesional refuerza la imagen de su institución médica."
  },
  {
    title: "Provea una grata experiencia en la atención",
    description: "Simplifique la reserva de turnos y mejore la satisfacción del paciente."
  }
];

const Pricing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="w-full py-16 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="w-full text-center mb-16 px-8 lg:px-16">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-700 dark:text-blue-400 mb-6">
          Elija el plan que mejor se ajuste a sus necesidades
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Ofrecemos distintas opciones de servicio según su tipo de consultorio y profesionales a cargo.
        </p>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 w-full md:max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            Un sistema de turnos médicos autogestionable, que facilita la atención y gestión de entidades médicas.
          </p>
          <button 
            onClick={() => window.location.href = '/contacto'}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Escríbanos y obtenga un plan personalizado
          </button>
        </div>
      </div>

      {/* Planes */}
      <div className="w-full px-8 lg:px-16 mb-20">
        <div className="grid md:grid-cols-3 gap-8 w-full">
          {tiers.map((tier) => (
            <div 
              key={tier.name} 
              className={`relative bg-white rounded-2xl shadow-lg p-8 w-full ${
                tier.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Más Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-700 mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">{tier.price}</div>
                <p className="text-gray-500">por mes</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => {
                  setSelectedPlan({ name: tier.name, price: tier.price });
                  setShowPaymentModal(true);
                }}
                className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                  tier.popular 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Elegir {tier.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Beneficios */}
      <div className="w-full px-8 lg:px-16">
        <h2 className="text-3xl font-bold text-blue-700 text-center mb-12">¿Por qué elegir TurnosAR?</h2>
        <div className="grid md:grid-cols-2 gap-8 w-full">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Pasarela de Pago */}
      {showPaymentModal && selectedPlan && (
        <PaymentGateway 
          planData={selectedPlan}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default Pricing;



