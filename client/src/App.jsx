import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home'; 
import AppointmentList from './pages/appointments/AppointmentList.jsx';
import AppointmentDetail from './pages/appointments/AppointmentDetail.jsx';
import AppointmentCreate from './pages/appointments/AppointmentCreate.jsx';
import AppointmentEdit from './pages/appointments/AppointmentEdit.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pricing from './pages/Pricing.jsx';
import FAQ from './pages/FAQ.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import FreeTrial from './pages/FreeTrial.jsx';
import PatientAppointments from './pages/appointments/PatientAppointments.jsx';
import Turnero from './pages/Turnero.jsx';
import PaymentGateway from './pages/PaymentGateway.jsx';
import PatientLogin from './pages/PatientLogin.jsx';
import PatientRegister from './pages/PatientRegister.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import NotFound from './pages/NotFound';

// Nuevas páginas
import About from './pages/About.jsx';
import AppPage from './pages/App.jsx';
import Awards from './pages/Awards.jsx';

// Páginas profesionales
import PersonalInfo from './pages/professional/PersonalInfo.jsx';
import AccountData from './pages/professional/AccountData.jsx';
import Collaborators from './pages/professional/Collaborators.jsx';
import Banks from './pages/professional/Banks.jsx';
import Addresses from './pages/professional/Addresses.jsx';
import ProfessionalCalendar from './pages/professional/Calendar.jsx';

// Layouts
import ProfessionalLayout from './components/ProfessionalLayout.jsx';

function App() {
  return (
    <div className="App bg-blue-50 min-h-screen">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/turnos" element={<AppointmentList />} />
          <Route path="/turnos/create" element={<AppointmentCreate />} />
          <Route path="/turnos/:id" element={<AppointmentDetail />} />
          <Route path="/turnos/:id/edit" element={<AppointmentEdit />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/precios" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/soy-paciente" element={<PatientLogin />} />
          <Route path="/mis-turnos" element={<PatientAppointments />} />
          <Route path="/turnero" element={<Turnero />} />
          <Route path="/payment-gateway" element={<PaymentGateway />} />
          <Route path="/patient-login" element={<PatientLogin />} />
          <Route path="/patient-register" element={<PatientRegister />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          
          {/* Nuevas rutas */}
          <Route path="/acerca-de" element={<About />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/premios" element={<Awards />} />
          
          {/* Rutas profesionales con layout específico */}
          <Route path="/professional" element={<ProfessionalLayout />}>
            <Route path="personal-info" element={<PersonalInfo />} />
            <Route path="account-data" element={<AccountData />} />
            <Route path="collaborators" element={<Collaborators />} />
            <Route path="banks" element={<Banks />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="calendar" element={<ProfessionalCalendar />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;



