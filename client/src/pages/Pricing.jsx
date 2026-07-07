import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentGateway from './PaymentGateway';

const tiers = [
  { 
    name: 'Plan Estándar', 
    price: 'US$9/mes', 
    popular: false,
    description: 'Ideal para profesionales independientes o consultorios particulares.',
    focus: 'Simplicidad y eficiencia para el consultorio de barrio.',
    features: [
      'Perfil Autogestionable: DNI persistente y seguro.',
      'Turnero Flexible: Reserva directa sin bloqueos de perfil.',
      'Consultorio Único: Soporte para dirección particular con prefijo "Consultorio".',
      'Hasta 2 profesionales.'
    ] 
  },
  { 
    name: 'Plan Premium', 
    price: 'US$19/mes', 
    popular: true,
    description: 'Perfecto para centros médicos en crecimiento y especialistas que analizan su gestión.',
    focus: 'El plan del "Dr. Méndez". Análisis de datos para tomar decisiones.',
    features: [
      'Dashboard de Analíticas: Gráficos de rendimiento por día, semana, mes y año.',
      'Filtro Federal: Presencia en la red nacional de las 24 provincias.',
      'Integración de Pagos: Confirmación automática de turnos tras el pago.',
      'Hasta 10 profesionales.',
      'Soporte prioritario para configuración de base de datos.'
    ] 
  },
  { 
    name: 'Plan Platino', 
    price: 'US$29/mes', 
    popular: false,
    description: 'Para instituciones médicas de gran escala y clínicas provinciales.',
    focus: 'Control total y escalabilidad masiva.',
    features: [
      'Red Médica Masiva: Gestión de múltiples clínicas y centros de salud.',
      'Infraestructura Dedicada: Optimización para altos volúmenes de datos.',
      'Analíticas Multicentro: Comparativa de rendimiento entre distintas sucursales.',
      'API para Integración: Conexión con otros sistemas de salud provinciales.'
    ] 
  },
];

const benefits = [
  {
    title: "Productividad Extrema 🚀",
    description: "Automatice tareas administrativas y enfoque su tiempo en lo que realmente importa: sus pacientes."
  },
  {
    title: "Presencia Digital 🌐",
    description: "Modernice su consultorio con herramientas digitales que sus pacientes esperan y valoran."
  },
  {
    title: "Confianza Total 🛡️",
    description: "Una plataforma profesional y segura refuerza la imagen de su institución médica ante la red."
  },
  {
    title: "Experiencia Superior 🏥",
    description: "Simplifique la reserva de turnos y mejore la satisfacción del paciente con flujos de baja fricción."
  },
  {
    title: "Análisis Inteligente 📊",
    description: "Tome decisiones basadas en datos reales con nuestro dashboard de analítica avanzada."
  },
  {
    title: "Alcance Federal 🇦🇷",
    description: "Conéctese con pacientes de las 24 provincias argentinas a través de nuestra red médica federal."
  }
];

const Pricing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="w-full py-16 bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <div className="w-full text-center mb-16 px-8 lg:px-16">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-700 dark:text-blue-400 mb-6 transition-colors duration-300">
          Elija el plan que mejor se ajuste a sus necesidades
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-300">
          Ofrecemos distintas opciones de servicio según su tipo de consultorio y profesionales a cargo.
        </p>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-8 w-full md:max-w-4xl mx-auto transition-colors duration-300">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 transition-colors duration-300">
            Un sistema de turnos médicos autogestionable, que facilita la atención y gestión de entidades médicas.
          </p>
          <button 
            onClick={() => window.location.href = '/contacto'}
            className="bg-blue-600 dark:bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
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
              className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-8 w-full transition-colors duration-300 ${
                tier.popular ? 'ring-2 ring-blue-500 dark:ring-blue-400 scale-105' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300">
                    Más Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2 transition-colors duration-300">{tier.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-12 flex items-center justify-center italic">"{tier.description}"</p>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{tier.price}</div>
                <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">por mes</p>
                <p className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-300">{tier.focus}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 dark:text-green-400 mt-1 transition-colors duration-300">✓</span>
                    <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => {
                  setSelectedPlan({ name: tier.name, price: tier.price });
                  setShowPaymentModal(true);
                }}
                className={`w-full py-3 rounded-xl font-semibold transition-colors duration-300 ${
                  tier.popular 
                    ? 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600' 
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                Elegir {tier.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full px-8 lg:px-16">
        <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-400 text-center mb-12 transition-colors duration-300">¿Por qué elegir TurnosAR?</h2>
        <div className="grid md:grid-cols-3 gap-8 w-full">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl p-6 transition-colors duration-300 border border-transparent hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-3 transition-colors duration-300">{benefit.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">{benefit.description}</p>
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



