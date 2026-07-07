import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Bell, 
  Settings, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Stethoscope, 
  Clock,
  ChevronDown,
  CheckCircle,
  X,
  Plus,
  Edit,
  Trash2,
  Save,
  Copy
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';

const PatientTurnos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useUser();
  const { addNotification, addPerfilUpdateNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('turno');
  const [formData, setFormData] = useState({
    provincia: '',
    clinica: '',
    especialidad: '',
    profesional: '',
    fecha: '',
    hora: ''
  });
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableHours, setAvailableHours] = useState([]);
  const [turnoRegistrado, setTurnoRegistrado] = useState(false);
  const [showDataForm, setShowDataForm] = useState(false);
  const [userData, setUserData] = useState({
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    obraSocial: '',
    direccion: '',
    provincia: '',
    localidad: '',
    codigoPostal: '',
    grupoSangre: '',
    enfermedades: '',
    alergias: ''
  });
  const [userDataErrors, setUserDataErrors] = useState({
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    obraSocial: '',
    direccion: '',
    provincia: '',
    localidad: '',
    codigoPostal: '',
    grupoSangre: '',
    enfermedades: '',
    alergias: ''
  });
  const [turnoErrors, setTurnoErrors] = useState({
    provincia: '',
    clinica: '',
    especialidad: '',
    profesional: '',
    fecha: '',
    hora: ''
  });
  const [turnos, setTurnos] = useState([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [datosCompletados, setDatosCompletados] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [turnoACancelar, setTurnoACancelar] = useState(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [editingBankId, setEditingBankId] = useState(null);
  const [banks, setBanks] = useState([
    {
      id: 1,
      banco: 'Banco Galicia',
      tipoCuenta: 'Caja de Ahorro',
      numeroCuenta: '876543210',
      cbu: '0070123456789012345678',
      alias: 'TURNOSAR.PACIENTE',
      titular: 'María González López',
      cuit: '27-87654321-0',
      estado: 'Activo',
      esPrincipal: true
    },
    {
      id: 2,
      banco: 'Banco Nación',
      tipoCuenta: 'Cuenta Corriente',
      numeroCuenta: '112233445',
      cbu: '0110123456789012345678',
      alias: 'MARIA.GONZALEZ',
      titular: 'María González López',
      cuit: '27-87654321-0',
      estado: 'Activo',
      esPrincipal: false
    }
  ]);
  const [bankForm, setBankForm] = useState({
    banco: '',
    tipoCuenta: '',
    numeroCuenta: '',
    cbu: '',
    alias: '',
    titular: '',
    cuit: ''
  });

  // Datos estáticos
  const provincias = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
    'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];

  const clinicas = [
    'Clínica Santa María',
    'Centro Médico San José',
    'Instituto de Salud Integral',
    'Clínica del Valle',
    'Centro de Diagnóstico Avanzado',
    'Clínica San Martín',
    'Instituto Cardiológico Argentino',
    'Centro Médico Norte',
    'Clínica de la Mujer',
    'Instituto de Traumatología'
  ];



  const especialidades = [
    'Medicina General',
    'Cardiología',
    'Dermatología',
    'Ginecología',
    'Pediatría',
    'Ortopedia',
    'Neurología',
    'Psicología',
    'Nutrición',
    'Odontología'
  ];

  const profesionales = [
    'Dr. Carlos Rodríguez - Cardiología',
    'Dra. María González - Dermatología',
    'Dr. Juan Pérez - Medicina General',
    'Dra. Ana López - Ginecología',
    'Dr. Roberto Silva - Pediatría'
  ];

  const bancos = [
    'Banco Galicia',
    'Banco Santander',
    'Banco Nación',
    'Banco Provincia',
    'Banco Ciudad',
    'Banco Macro',
    'Banco HSBC',
    'Banco Itaú',
    'Banco Supervielle',
    'Banco Credicoop'
  ];

  const tiposCuenta = [
    'Caja de Ahorro',
    'Cuenta Corriente',
    'Cuenta Especial'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (turnoErrors[name]) {
      setTurnoErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Resetear campos dependientes
    if (name === 'provincia') {
      setFormData(prev => ({ ...prev, clinica: '', especialidad: '', profesional: '', fecha: '', hora: '' }));
    } else if (name === 'clinica') {
      setFormData(prev => ({ ...prev, especialidad: '', profesional: '', fecha: '', hora: '' }));
    } else if (name === 'especialidad') {
      setFormData(prev => ({ ...prev, profesional: '', fecha: '', hora: '' }));
    } else if (name === 'profesional') {
      setFormData(prev => ({ ...prev, fecha: '', hora: '' }));
    }
  };

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (userDataErrors[name]) {
      setUserDataErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validaciones
  const validateUserData = () => {
    const errors = {};
    
    // Validar nombre (solo letras y espacios, NO números)
    if (!userData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(userData.nombre.trim())) {
      errors.nombre = 'El nombre solo puede contener letras y espacios. No se permiten números ni caracteres especiales';
    } else if (userData.nombre.trim().length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (userData.nombre.trim().length > 50) {
      errors.nombre = 'El nombre no puede exceder 50 caracteres';
    } else if (/\d/.test(userData.nombre.trim())) {
      errors.nombre = 'El nombre no puede contener números';
    }
    
    // Validar DNI
    if (!userData.dni.trim()) {
      errors.dni = 'El DNI es obligatorio';
    } else if (!/^[0-9]{7,8}$/.test(userData.dni.trim())) {
      errors.dni = 'El DNI debe tener 7 u 8 dígitos numéricos';
    }
    
    // Validar email
    if (!userData.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email.trim())) {
      errors.email = 'Ingresa un email válido';
    } else if (userData.email.trim().length > 100) {
      errors.email = 'El email no puede exceder 100 caracteres';
    }
    
    // Validar teléfono
    if (!userData.telefono.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    } else if (!/^[\+]?[0-9\s\-\(\)]+$/.test(userData.telefono.trim())) {
      errors.telefono = 'Ingresa un teléfono válido (solo números, espacios, guiones y paréntesis)';
    } else if (userData.telefono.trim().length < 8) {
      errors.telefono = 'El teléfono debe tener al menos 8 dígitos';
    } else if (userData.telefono.trim().length > 20) {
      errors.telefono = 'El teléfono no puede exceder 20 caracteres';
    }
    
    return errors;
  };

  const validateTurno = () => {
    const errors = {};
    
    if (!formData.provincia) errors.provincia = 'Selecciona una provincia';
    if (!formData.clinica) errors.clinica = 'Selecciona una clínica';
    if (!formData.especialidad) errors.especialidad = 'Selecciona una especialidad';
    if (!formData.profesional) errors.profesional = 'Selecciona un profesional';
    if (!formData.fecha) errors.fecha = 'Selecciona una fecha';
    if (!formData.hora) errors.hora = 'Selecciona una hora';
    
    return errors;
  };

  // Cargar turnos del paciente
  const cargarTurnos = async () => {
    setLoadingTurnos(true);
    try {
      // Intentar cargar desde /turnos primero
      try {
        const response = await axiosInstance.get('/turnos');
        if (response.data && Array.isArray(response.data)) {
          // Filtrar turnos del paciente actual (por DNI o email)
          const turnosPaciente = response.data.filter(turno => 
            turno.pacienteId === '123' || 
            turno.email === userData.email ||
            turno.dni === userData.dni
          );
          setTurnos(turnosPaciente);
          return;
        }
      } catch (turnoError) {
        console.log('Endpoint /turnos no disponible, intentando cargar desde /pacientes');
      }

      // Si no hay /turnos, cargar desde /pacientes
      try {
        const response = await axiosInstance.get('/pacientes');
        if (response.data && Array.isArray(response.data)) {
          // Filtrar registros que tengan fecha y hora (son turnos)
          const turnosPaciente = response.data.filter(paciente => 
            paciente.fecha && 
            paciente.hora && 
            paciente.fecha !== 'pendiente' && 
            paciente.hora !== 'pendiente' &&
            (paciente.email === userData.email || paciente.dni === userData.dni)
          );
          setTurnos(turnosPaciente);
        }
      } catch (pacienteError) {
        console.log('No se pudieron cargar los turnos desde /pacientes');
        setTurnos([]);
      }
    } catch (error) {
      console.error('Error al cargar turnos:', error);
      setTurnos([]);
    } finally {
      setLoadingTurnos(false);
    }
  };

  // Cargar turnos cuando cambie la pestaña o se registre un nuevo turno
  useEffect(() => {
    if (activeTab === 'mis-turnos') {
      cargarTurnos();
    }
  }, [activeTab]);

  // Cargar turnos cuando se registre un nuevo turno
  useEffect(() => {
    if (turnoRegistrado) {
      cargarTurnos();
    }
  }, [turnoRegistrado]);

  // Manejar parámetros de URL para navegación desde el menú
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && ['turno', 'mis-turnos', 'perfil', 'bancos'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Cerrar modal de éxito automáticamente después de 5 segundos
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  // Cargar datos del usuario desde el contexto al montar el componente
  useEffect(() => {
    if (user && user.nombre) {
      setUserData(prev => ({
        ...prev,
        nombre: user.nombre || '',
        email: user.email || '',
        dni: user.dni || '',
        fechaNacimiento: user.fechaNacimiento || '',
        provincia: user.provincia || '',
        clinica: user.clinica || '',
        especialidad: user.especialidad || '',
        profesional: user.profesional || '',
        obraSocial: user.obraSocial || '',
        direccion: user.direccion || '',
        localidad: user.localidad || '',
        codigoPostal: user.codigoPostal || '',
        grupoSangre: user.grupoSangre || '',
        enfermedades: user.enfermedades || '',
        alergias: user.alergias || ''
      }));
    }
  }, [user]);

  // Manejar mensajes de bienvenida y estado de navegación
  useEffect(() => {
    if (location.state && location.state.mensaje) {
      // Solo mostrar mensajes de bienvenida en casos específicos, no al navegar normalmente
      const esMensajeCompletarPerfil = location.state.mensaje.includes('completa tus datos') || 
                                      location.state.mensaje.includes('Por favor completa');
      
      // Solo mostrar modal si:
      // 1. Es un mensaje de bienvenida específico (no de navegación normal)
      // 2. NO es un mensaje de "completar perfil" cuando ya está completo
      const esMensajeBienvenida = location.state.mensaje.includes('Bienvenido') || 
                                  location.state.mensaje.includes('Registro exitoso') ||
                                  location.state.mensaje.includes('Tus datos están completos');
      
      if (esMensajeBienvenida && (!esMensajeCompletarPerfil || !datosCompletados)) {
        setWelcomeMessage(location.state.mensaje);
        setShowWelcomeModal(true);
        
        // Si el mensaje indica que los datos están completos, agregar notificación
        if (location.state.mensaje.includes('Tus datos están completos') || 
            location.state.mensaje.includes('perfil está completo')) {
          addNotification({
            type: 'bienvenida',
            message: '¡Bienvenido! Tu perfil está completo y puedes solicitar turnos.',
            timestamp: new Date()
          });
        }
      }
    }
  }, [location.state, addNotification, datosCompletados]);

  // Verificar si los datos ya están completos al cargar la página
  useEffect(() => {
    // Verificar si los datos están completos en el estado local
    const datosLocalesCompletos = userData.nombre && userData.dni && userData.email && userData.telefono;
    
    // Verificar si los datos están completos en el contexto del usuario
    const datosUsuarioCompletos = user && user.nombre && user.email && user.dni;
    
    // Si cualquiera de los dos está completo, marcar como completado
    if (datosLocalesCompletos || datosUsuarioCompletos) {
      setDatosCompletados(true);
    }
  }, [userData.nombre, userData.dni, userData.email, userData.telefono, user]);

  // Función para abrir modal de cancelación
  const abrirModalCancelacion = (turno) => {
    setTurnoACancelar(turno);
    setShowCancelModal(true);
  };

  // Función para cancelar turno
  const confirmarCancelacion = async () => {
    if (!turnoACancelar) return;

    try {
      // Intentar cancelar en /turnos primero
      try {
        await axiosInstance.put(`/turnos/${turnoACancelar.id}`, {
          ...turnoACancelar,
          estado: 'cancelado',
          fechaCancelacion: new Date().toISOString()
        });
      } catch (turnoError) {
        console.log('Endpoint /turnos no disponible, intentando cancelar en /pacientes');
      }

      // Si no hay /turnos, cancelar en /pacientes
      try {
        await axiosInstance.put(`/pacientes/${turnoACancelar.id}`, {
          ...turnoACancelar,
          estado: 'cancelado',
          fechaCancelacion: new Date().toISOString()
        });
      } catch (pacienteError) {
        console.log('No se pudo cancelar en /pacientes');
      }

      // Actualizar estado local
      setTurnos(prev => prev.map(t => 
        t.id === turnoACancelar.id 
          ? { ...t, estado: 'cancelado' }
          : t
      ));

      // Agregar notificación de turno cancelado
      const profesionalNombre = turnoACancelar.profesional || 'Profesional';
      addNotification({
        type: 'cancelacion',
        message: `Cancelaste tu turno con ${profesionalNombre}`,
        action: 'ver-turnos',
        actionData: { profesional: profesionalNombre }
      });

      // Cerrar modal y mostrar mensaje de éxito
      setShowCancelModal(false);
      setTurnoACancelar(null);
      setSuccessMessage('Turno cancelado exitosamente');
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error al cancelar turno:', error);
      alert('Error al cancelar el turno. Intenta nuevamente.');
    }
  };

  // Función para confirmar asistencia
  const confirmarAsistencia = () => {
    // Agregar notificación de asistencia confirmada
    const profesionalNombre = turnoACancelar?.profesional || 'Profesional';
    addNotification({
      type: 'asistencia',
      message: `Confirmaste tu asistencia al turno con ${profesionalNombre}`,
      action: 'ver-turnos',
      actionData: { profesional: profesionalNombre }
    });

    setShowCancelModal(false);
    setTurnoACancelar(null);
    setSuccessMessage('Has confirmado tu asistencia al turno');
    setShowSuccessModal(true);
  };

  // Función para verificar si se puede cancelar (48 horas antes)
  const sePuedeCancelar = (fechaTurno) => {
    if (!fechaTurno) return false;
    
    const fechaTurnoDate = new Date(fechaTurno);
    const ahora = new Date();
    const diferenciaHoras = (fechaTurnoDate - ahora) / (1000 * 60 * 60);
    
    return diferenciaHoras >= 48;
  };

  // Funciones para manejar bancos
  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitBank = (e) => {
    e.preventDefault();
    
    if (editingBankId) {
      // Editar banco existente
      setBanks(prev => prev.map(bank => 
        bank.id === editingBankId 
          ? { ...bank, ...bankForm, id: editingBankId }
          : bank
      ));
      setEditingBankId(null);
    } else {
      // Agregar nuevo banco
      const newBank = {
        ...bankForm,
        id: Date.now(),
        estado: 'Activo',
        esPrincipal: banks.length === 0 // El primero será principal
      };
      setBanks(prev => [...prev, newBank]);
    }
    
    setBankForm({
      banco: '',
      tipoCuenta: '',
      numeroCuenta: '',
      cbu: '',
      alias: '',
      titular: '',
      cuit: ''
    });
    setShowBankForm(false);
  };

  const handleEditBank = (bank) => {
    setBankForm({
      banco: bank.banco,
      tipoCuenta: bank.tipoCuenta,
      numeroCuenta: bank.numeroCuenta,
      cbu: bank.cbu,
      alias: bank.alias,
      titular: bank.titular,
      cuit: bank.cuit
    });
    setEditingBankId(bank.id);
    setShowBankForm(true);
  };

  const handleDeleteBank = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cuenta bancaria?')) {
      setBanks(prev => prev.filter(bank => bank.id !== id));
    }
  };

  const handleCancelBank = () => {
    setBankForm({
      banco: '',
      tipoCuenta: '',
      numeroCuenta: '',
      cbu: '',
      alias: '',
      titular: '',
      cuit: ''
    });
    setEditingBankId(null);
    setShowBankForm(false);
  };

  const setAsPrimaryBank = (id) => {
    setBanks(prev => prev.map(bank => ({
      ...bank,
      esPrincipal: bank.id === id
    })));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías mostrar un toast de confirmación
  };

  const handleProfesionalSelect = () => {
    if (formData.profesional) {
      setShowCalendar(true);
      generateAvailableHours();
    }
  };

  const generateAvailableHours = () => {
    // Generar horarios disponibles (8:00 a 18:00)
    const hours = [];
    for (let i = 8; i <= 18; i++) {
      // Simular algunos horarios ocupados
      if (Math.random() > 0.3) { // 70% de probabilidad de estar disponible
        hours.push(`${i.toString().padStart(2, '0')}:00`);
      }
    }
    setAvailableHours(hours);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, fecha: date }));
    generateAvailableHours(); // Regenerar horarios para la nueva fecha
  };

  const handleHourSelect = (hour) => {
    setFormData(prev => ({ ...prev, hora: hour }));
    setShowCalendar(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar turno
    const errors = validateTurno();
    if (Object.keys(errors).length > 0) {
      setTurnoErrors(errors);
      return;
    }

    setLoading(true);

    try {
      // Intentar guardar en /turnos primero
      let turnoGuardado = false;
      
      try {
        const turnoData = {
          ...formData,
          pacienteId: '123', // ID del paciente logueado
          estado: 'confirmado',
          fechaCreacion: new Date().toISOString()
        };

        const response = await axiosInstance.post('/turnos', turnoData);
        if (response.data) {
          turnoGuardado = true;
        }
      } catch (turnoError) {
        console.log('Endpoint /turnos no disponible, intentando guardar en /pacientes');
      }

      // Si no se pudo guardar en /turnos, guardar en /pacientes
      if (!turnoGuardado) {
        try {
          // Crear nuevo turno en /pacientes
          const nuevoTurno = {
            nombre: userData.nombre || 'Paciente',
            email: userData.email || 'email@ejemplo.com',
            telefono: userData.telefono || 'Sin teléfono',
            fecha: formData.fecha,
            hora: formData.hora,
            estado: 'confirmado',
            profesional: formData.profesional,
            clinica: formData.clinica,
            especialidad: formData.especialidad,
            provincia: formData.provincia,
            createdAt: Date.now()
          };

          const response = await axiosInstance.post('/pacientes', nuevoTurno);
          if (response.data) {
            console.log('Turno guardado exitosamente en /pacientes:', response.data);
            turnoGuardado = true;
          }
        } catch (pacienteError) {
          console.log('No se pudo guardar en /pacientes, usando simulación');
          // Simular delay de guardado
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Agregar notificación de turno solicitado
      const profesionalNombre = formData.profesional.split(' - ')[0];
      const especialidad = formData.profesional.split(' - ')[1];
      
      addNotification({
        type: 'turno',
        message: `Pediste un turno para ${profesionalNombre} - ${especialidad}`,
        action: 'ver-turno',
        actionData: { 
          fecha: formData.fecha, 
          hora: formData.hora, 
          profesional: formData.profesional 
        }
      });

      setTurnoRegistrado(true);
      setTimeout(() => {
        setTurnoRegistrado(false);
        setFormData({
          provincia: '',
          clinica: '',
          especialidad: '',
          profesional: '',
          fecha: '',
          hora: ''
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error al registrar turno:', error);
      alert('Error al registrar el turno. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserDataSubmit = async (e) => {
    e.preventDefault();
    
    // Validar datos
    const errors = validateUserData();
    if (Object.keys(errors).length > 0) {
      setUserDataErrors(errors);
      return;
    }

    try {
      // Intentar actualizar en /pacientes
      try {
        const response = await axiosInstance.put(`/pacientes/1`, {
          ...userData,
          fechaActualizacion: new Date().toISOString()
        });
        console.log('Datos actualizados en /pacientes:', response.data);
      } catch (updateError) {
        console.log('No se pudo actualizar en /pacientes, intentando crear nuevo registro');
        
        // Si no se puede actualizar, crear nuevo registro
        try {
          const nuevoPaciente = {
            ...userData,
            fecha: new Date().toISOString(),
            hora: 'pendiente',
            estado: 'activo',
            profesional: 'pendiente',
            createdAt: Date.now()
          };
          
          const response = await axiosInstance.post('/pacientes', nuevoPaciente);
          console.log('Nuevo paciente creado en /pacientes:', response.data);
        } catch (createError) {
          console.log('No se pudo crear en /pacientes, usando simulación');
        }
      }

      // Cerrar el formulario de datos y marcar como completos
      setShowDataForm(false);
      setDatosCompletados(true);
      
      // Cerrar cualquier modal de bienvenida abierto para evitar mensajes contradictorios
      setShowWelcomeModal(false);
      
      // Limpiar el estado de navegación para evitar mensajes no deseados
      window.history.replaceState({}, document.title);
      
      // Actualizar el contexto del usuario con los nuevos datos
      if (updateUser) {
        updateUser({
          ...user,
          nombre: userData.nombre,
          email: userData.email,
          dni: userData.dni
        });
      }

      // Agregar notificación de perfil completado
      addNotification({
        type: 'perfil',
        message: '¡Perfil completado! Ya puedes solicitar turnos médicos',
        action: 'ver-perfil',
        actionData: {}
      });
      
      // También agregar notificación usando la función específica
      addPerfilUpdateNotification();
      
      setSuccessMessage('Datos guardados exitosamente. Ahora puedes solicitar tu turno.');
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error al guardar datos:', error);
      alert('Error al guardar los datos. Intenta nuevamente.');
    }
  };



  const renderCalendar = () => {
    if (!showCalendar) return null;

    const today = new Date();
    const days = [];
    
    // Generar próximos 30 días
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Seleccionar Fecha</h3>
            <button onClick={() => setShowCalendar(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => (
              <button
                key={index}
                onClick={() => handleDateSelect(date.toISOString().split('T')[0])}
                className={`p-2 text-sm rounded-lg hover:bg-blue-50 ${
                  selectedDate === date.toISOString().split('T')[0] 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700'
                }`}
              >
                {date.getDate()}
              </button>
            ))}
          </div>
          
          {selectedDate && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Horarios disponibles para {selectedDate}:</h4>
              <div className="grid grid-cols-3 gap-2">
                {availableHours.map((hour, index) => (
                  <button
                    key={index}
                    onClick={() => handleHourSelect(hour)}
                    className="p-2 text-sm border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300"
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (turnoRegistrado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-4">¡Turno Guardado!</h2>
          <p className="text-gray-600 mb-6">
            Tu turno ha sido registrado exitosamente. Recibirás una confirmación por email.
          </p>
          <div className="text-sm text-gray-500">
            Redirigiendo al inicio...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
              {userData.nombre && userData.nombre.trim() 
                ? `Bienvenido ${userData.nombre}` 
                : 'Mis Turnos'
              }
            </h1>
                <p className="text-sm text-gray-500">Bienvenido a TurnosAR</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cartel para completar datos personales */}
        {!showDataForm && !datosCompletados && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  ¡Completa estos datos importantes!
                </h3>
                <p className="text-blue-700 mb-4">
                  Para poder pedir el turno y que pueda llegarte la notificación, necesitamos que completes:
                </p>
                <ul className="text-blue-600 mb-4 space-y-1">
                  <li>• <strong>Nombre y Apellido</strong></li>
                  <li>• <strong>DNI</strong></li>
                  <li>• <strong>Email</strong></li>
                  <li>• <strong>Teléfono</strong></li>
                </ul>
                <button
                  onClick={() => setShowDataForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  📝 Completar Datos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de confirmación cuando los datos están completos */}
        {!showDataForm && datosCompletados && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  ¡Datos Completos!
                </h3>
                <p className="text-green-700 mb-4">
                  Ya tienes todos los datos necesarios. Puedes solicitar tu turno médico cuando quieras.
                </p>
                <button
                  onClick={() => setShowDataForm(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  📝 Editar Datos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de datos personales */}
        {showDataForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Completar Datos Personales</h2>
                <p className="text-sm text-gray-600 mt-1">Haz clic en tu foto de perfil para editar estos datos</p>
              </div>
              <button
                onClick={() => setShowDataForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUserDataSubmit} className="space-y-6">
              {/* Datos Obligatorios */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">📋 Datos Obligatorios</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      value={userData.nombre}
                      onChange={handleUserDataChange}
                      name="nombre"
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                        userDataErrors.nombre ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Tu nombre completo"
                      required
                    />
                    {userDataErrors.nombre && (
                      <p className="mt-1 text-sm text-red-600">{userDataErrors.nombre}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DNI *
                    </label>
                    <input
                      type="text"
                      value={userData.dni}
                      onChange={handleUserDataChange}
                      name="dni"
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                        userDataErrors.dni ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="12345678"
                      required
                    />
                    {userDataErrors.dni && (
                      <p className="mt-1 text-sm text-red-600">{userDataErrors.dni}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={handleUserDataChange}
                      name="email"
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                        userDataErrors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="tu@email.com"
                      required
                    />
                    {userDataErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{userDataErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={userData.telefono}
                      onChange={handleUserDataChange}
                      name="telefono"
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                        userDataErrors.telefono ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+54 9 11 1234-5678"
                      required
                    />
                    {userDataErrors.telefono && (
                      <p className="mt-1 text-sm text-red-600">{userDataErrors.telefono}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Datos No Obligatorios */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">📝 Datos No Obligatorios</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Obra Social
                    </label>
                    <input
                      type="text"
                      value={userData.obraSocial}
                      onChange={handleUserDataChange}
                      name="obraSocial"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      placeholder="Ej: OSDE, Swiss Medical, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={userData.direccion}
                      onChange={handleUserDataChange}
                      name="direccion"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      placeholder="Calle y número"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provincia
                    </label>
                    <select
                      value={userData.provincia}
                      onChange={handleUserDataChange}
                      name="provincia"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    >
                      <option value="">Selecciona una provincia</option>
                      {provincias.map(provincia => (
                        <option key={provincia} value={provincia}>{provincia}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localidad
                    </label>
                    <input
                      type="text"
                      value={userData.localidad}
                      onChange={handleUserDataChange}
                      name="localidad"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      placeholder="Ciudad o pueblo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={userData.codigoPostal}
                      onChange={handleUserDataChange}
                      name="codigoPostal"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      placeholder="1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grupo de Sangre
                    </label>
                    <select
                      value={userData.grupoSangre}
                      onChange={handleUserDataChange}
                      name="grupoSangre"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    >
                      <option value="">Selecciona grupo sanguíneo</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enfermedades
                    </label>
                    <textarea
                      value={userData.enfermedades}
                      onChange={handleUserDataChange}
                      name="enfermedades"
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      placeholder="Lista de enfermedades crónicas o condiciones médicas (opcional)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alergias
                    </label>
                    <textarea
                      value={userData.alergias}
                      onChange={handleUserDataChange}
                      name="alergias"
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      placeholder="Lista de alergias conocidas (opcional)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowDataForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Guardar Datos
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs de Navegación */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8">
          {[
            { id: 'turno', label: 'Pedir Turno', icon: Calendar },
            { id: 'mis-turnos', label: 'Mis Turnos', icon: Clock },
            { id: 'perfil', label: 'Mi Perfil', icon: User },
            { id: 'bancos', label: 'Bancos', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenido Principal */}
        {activeTab === 'turno' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Solicitar Turno Médico</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Provincia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Provincia
                  </label>
                  <select
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                      turnoErrors.provincia ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Selecciona una provincia</option>
                    {provincias.map(provincia => (
                      <option key={provincia} value={provincia}>{provincia}</option>
                    ))}
                  </select>
                  {turnoErrors.provincia && (
                    <p className="mt-1 text-sm text-red-600">{turnoErrors.provincia}</p>
                  )}
                </div>

                {/* Clínica */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Clínica
                  </label>
                  <select
                    name="clinica"
                    value={formData.clinica}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                      turnoErrors.clinica ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={!formData.provincia}
                  >
                    <option value="">Selecciona una clínica</option>
                    {clinicas.map(clinica => (
                      <option key={clinica} value={clinica}>{clinica}</option>
                    ))}
                  </select>
                  {turnoErrors.clinica && (
                    <p className="mt-1 text-sm text-red-600">{turnoErrors.clinica}</p>
                  )}
                </div>

                {/* Especialidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Stethoscope className="w-4 h-4 inline mr-2" />
                    Especialidad
                  </label>
                  <select
                    name="especialidad"
                    value={formData.especialidad}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                      turnoErrors.especialidad ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={!formData.clinica}
                  >
                    <option value="">Selecciona una especialidad</option>
                    {especialidades.map(especialidad => (
                      <option key={especialidad} value={especialidad}>{especialidad}</option>
                    ))}
                  </select>
                  {turnoErrors.especialidad && (
                    <p className="mt-1 text-sm text-red-600">{turnoErrors.especialidad}</p>
                  )}
                </div>

                {/* Profesional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Profesional
                  </label>
                  <select
                    name="profesional"
                    value={formData.profesional}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                      turnoErrors.profesional ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={!formData.especialidad}
                  >
                    <option value="">Selecciona un profesional</option>
                    {profesionales.map(profesional => (
                      <option key={profesional} value={profesional}>{profesional}</option>
                    ))}
                  </select>
                  {turnoErrors.profesional && (
                    <p className="mt-1 text-sm text-red-600">{turnoErrors.profesional}</p>
                  )}
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha
                  </label>
                  <button
                    type="button"
                    onClick={handleProfesionalSelect}
                    disabled={!formData.profesional}
                    className={`w-full border rounded-lg px-4 py-3 text-left focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      turnoErrors.fecha ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {formData.fecha || 'Selecciona fecha y hora'}
                  </button>
                  {turnoErrors.fecha && (
                    <p className="mt-1 text-sm text-red-600">{turnoErrors.fecha}</p>
                  )}
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Hora
                  </label>
                  <input
                    type="text"
                    value={formData.hora}
                    readOnly
                    className={`w-full border rounded-lg px-4 py-3 bg-gray-50 ${
                      turnoErrors.hora ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Se selecciona con la fecha"
                  />
                  {turnoErrors.hora && (
                    <p className="mt-1 text-sm text-red-600">{turnoErrors.hora}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.fecha || !formData.hora}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registrando turno...
                  </>
                ) : (
                  'Registrar Turno'
                )}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'mis-turnos' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mis Turnos</h2>
              <button
                onClick={cargarTurnos}
                disabled={loadingTurnos}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loadingTurnos ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualizar
                  </>
                )}
              </button>
            </div>

            {loadingTurnos ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Cargando turnos...</p>
              </div>
            ) : turnos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes turnos programados</h3>
                <p className="text-gray-500 mb-4">Cuando solicites un turno, aparecerá aquí</p>
                <button
                  onClick={() => setActiveTab('turno')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Solicitar Turno
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {turnos.map((turno, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {turno.especialidad || 'Especialidad médica'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {turno.profesional || 'Profesional'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Clínica:</span>
                            <p className="text-gray-600">{turno.clinica || 'No especificada'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Provincia:</span>
                            <p className="text-gray-600">{turno.provincia || 'No especificada'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Fecha:</span>
                            <p className="text-gray-600">
                              {turno.fecha ? new Date(turno.fecha).toLocaleDateString('es-AR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 'No especificada'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Hora:</span>
                            <p className="text-gray-600">{turno.hora || 'No especificada'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          turno.estado === 'confirmado' 
                            ? 'bg-green-100 text-green-700' 
                            : turno.estado === 'pendiente'
                            ? 'bg-yellow-100 text-yellow-700'
                            : turno.estado === 'cancelado'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {turno.estado === 'confirmado' ? 'Confirmado' : 
                           turno.estado === 'pendiente' ? 'Pendiente' : 
                           turno.estado === 'cancelado' ? 'Cancelado' :
                           turno.estado || 'Sin estado'}
                        </span>
                        
                        <div className="text-xs text-gray-500">
                          ID: {turno.id || 'N/A'}
                        </div>

                        {/* Botón de cancelar - solo mostrar si no está cancelado */}
                        {turno.estado !== 'cancelado' && (
                          <button
                            onClick={() => abrirModalCancelacion(turno)}
                            disabled={!sePuedeCancelar(turno.fecha)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                              sePuedeCancelar(turno.fecha)
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            title={
                              sePuedeCancelar(turno.fecha)
                                ? 'Cancelar turno'
                                : 'Solo puedes cancelar 48 horas antes del turno'
                            }
                          >
                            {sePuedeCancelar(turno.fecha) ? 'Cancelar' : 'No cancelable'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
              <button
                onClick={() => setShowDataForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {datosCompletados ? 'Editar Perfil' : 'Completar Perfil'}
              </button>
            </div>
            
            {datosCompletados ? (
              <div className="space-y-6">
                {/* Datos Obligatorios */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <span>📋</span>
                    Datos Obligatorios
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-blue-700">Nombre completo:</span>
                      <p className="text-blue-900 font-semibold">{userData.nombre || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-700">DNI:</span>
                      <p className="text-blue-900 font-semibold">{userData.dni || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-700">Email:</span>
                      <p className="text-blue-900 font-semibold">{userData.email || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-700">Teléfono:</span>
                      <p className="text-blue-900 font-semibold">{userData.telefono || 'No especificado'}</p>
                    </div>
                  </div>
                </div>

                {/* Datos No Obligatorios */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>📝</span>
                    Datos No Obligatorios
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Obra social:</span>
                      <p className="text-gray-900">{userData.obraSocial || 'No especificada'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Dirección:</span>
                      <p className="text-gray-900">{userData.direccion || 'No especificada'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Provincia:</span>
                      <p className="text-gray-900">{userData.provincia || 'No especificada'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Localidad:</span>
                      <p className="text-gray-900">{userData.localidad || 'No especificada'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Código postal:</span>
                      <p className="text-gray-900">{userData.codigoPostal || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Grupo de sangre:</span>
                      <p className="text-gray-900">{userData.grupoSangre || 'No especificado'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-700">Enfermedades:</span>
                      <p className="text-gray-900">{userData.enfermedades || 'No especificadas'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-700">Alergias:</span>
                      <p className="text-gray-900">{userData.alergias || 'No especificadas'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Perfil incompleto</h3>
                <p className="text-gray-500 mb-6">Completa tu información personal para acceder a todas las funcionalidades</p>
                <button
                  onClick={() => setShowDataForm(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Completar Perfil
                </button>
              </div>
            )}
          </div>
        )}


        
        {/* Pestaña de Bancos */}
        {activeTab === 'bancos' ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-blue-700 mb-2">Bancos</h2>
              <p className="text-gray-600">Gestioná tus cuentas bancarias para realizar pagos de turnos</p>
            </div>

            {/* Botón agregar */}
            <div className="mb-6">
              <button
                onClick={() => setShowBankForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar Cuenta Bancaria
              </button>
            </div>

            {/* Formulario de agregar/editar banco */}
            {showBankForm && (
              <div className="mb-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingBankId ? 'Editar Cuenta Bancaria' : 'Agregar Nueva Cuenta Bancaria'}
                  </h3>
                  <button
                    onClick={handleCancelBank}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitBank} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Banco</label>
                      <select
                        name="banco"
                        value={bankForm.banco}
                        onChange={handleBankChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      >
                        <option value="">Seleccionar banco</option>
                        {bancos.map(banco => (
                          <option key={banco} value={banco}>{banco}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Cuenta</label>
                      <select
                        name="tipoCuenta"
                        value={bankForm.tipoCuenta}
                        onChange={handleBankChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      >
                        <option value="">Seleccionar tipo</option>
                        {tiposCuenta.map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número de Cuenta</label>
                      <input
                        type="text"
                        name="numeroCuenta"
                        value={bankForm.numeroCuenta}
                        onChange={handleBankChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CBU</label>
                      <input
                        type="text"
                        name="cbu"
                        value={bankForm.cbu}
                        onChange={handleBankChange}
                        required
                        placeholder="22 dígitos"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alias</label>
                      <input
                        type="text"
                        name="alias"
                        value={bankForm.alias}
                        onChange={handleBankChange}
                        required
                        placeholder="ej: TURNOSAR.PACIENTE"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Titular</label>
                      <input
                        type="text"
                        name="titular"
                        value={bankForm.titular}
                        onChange={handleBankChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CUIT</label>
                      <input
                        type="text"
                        name="cuit"
                        value={bankForm.cuit}
                        onChange={handleBankChange}
                        required
                        placeholder="XX-XXXXXXXX-X"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancelBank}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {editingBankId ? 'Actualizar' : 'Agregar'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista de bancos */}
            <div className="grid md:grid-cols-2 gap-6">
              {banks.map((bank) => (
                <div key={bank.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  {/* Header de la tarjeta */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{bank.banco}</h3>
                        <p className="text-sm text-gray-600">{bank.tipoCuenta}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {bank.esPrincipal && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Principal
                        </span>
                      )}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditBank(bank)}
                          className="p-1 text-blue-600 hover:text-blue-900 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBank(bank.id)}
                          className="p-1 text-red-600 hover:text-red-900 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Información de la cuenta */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Número de cuenta:</span>
                      <span className="text-sm font-medium text-gray-900">{bank.numeroCuenta}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">CBU:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-900">{bank.cbu}</span>
                        <button
                          onClick={() => copyToClipboard(bank.cbu)}
                          className="p-1 text-blue-600 hover:text-blue-900 rounded"
                          title="Copiar CBU"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Alias:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{bank.alias}</span>
                        <button
                          onClick={() => copyToClipboard(bank.alias)}
                          className="p-1 text-blue-600 hover:text-blue-900 rounded"
                          title="Copiar Alias"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Titular:</span>
                      <span className="text-sm font-medium text-gray-900">{bank.titular}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">CUIT:</span>
                      <span className="text-sm font-medium text-gray-900">{bank.cuit}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    {!bank.esPrincipal && (
                      <button
                        onClick={() => setAsPrimaryBank(bank.id)}
                        className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        Establecer como Principal
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mensaje si no hay bancos */}
            {banks.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cuentas bancarias</h3>
                <p className="text-gray-600 mb-4">Agregá tu primera cuenta bancaria para realizar pagos de turnos</p>
                <button
                  onClick={() => setShowBankForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Agregar Cuenta Bancaria
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Calendario Modal */}
      {renderCalendar()}

      {/* Modal de Éxito */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowSuccessModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cerrar */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              {/* Icono de éxito */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              {/* Título */}
              <h3 className="text-2xl font-bold text-green-700 mb-4">
                ¡Éxito!
              </h3>
              
              {/* Mensaje */}
              <p className="text-gray-600 mb-8 text-lg">
                {successMessage}
              </p>
              
              {/* Botón de cerrar */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelación de Turno */}
      {showCancelModal && turnoACancelar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCancelModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cerrar */}
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              {/* Icono de advertencia */}
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              {/* Título */}
              <h3 className="text-2xl font-bold text-yellow-700 mb-4">
                ¿Cancelar Turno?
              </h3>
              
              {/* Información del turno */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Detalles del turno:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Especialidad:</strong> {turnoACancelar.especialidad || 'No especificada'}</p>
                  <p><strong>Profesional:</strong> {turnoACancelar.profesional || 'No especificado'}</p>
                  <p><strong>Fecha:</strong> {turnoACancelar.fecha ? new Date(turnoACancelar.fecha).toLocaleDateString('es-AR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'No especificada'}</p>
                  <p><strong>Hora:</strong> {turnoACancelar.hora || 'No especificada'}</p>
                </div>
              </div>

              {/* Advertencia importante */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-left">
                    <h5 className="font-semibold text-red-800 mb-1">¡Advertencia Importante!</h5>
                    <p className="text-red-700 text-sm">
                      Solo puedes cancelar <strong>48 horas antes</strong> del turno. 
                      De lo contrario, <strong>NO se te reembolsará el dinero</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={confirmarAsistencia}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Asistiré al turno
                </button>
                <button
                  onClick={confirmarCancelacion}
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Confirmar cancelación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bienvenida */}
      {showWelcomeModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowWelcomeModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cerrar */}
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              {/* Icono de bienvenida */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              {/* Título dinámico */}
              <h3 className="text-2xl font-bold text-green-700 mb-4">
                {welcomeMessage && welcomeMessage.includes('completa tus datos') 
                  ? 'Completa tu perfil' 
                  : welcomeMessage && welcomeMessage.includes('Registro exitoso')
                  ? '¡Registro exitoso!'
                  : '¡Bienvenido!'
                }
              </h3>
              
              {/* Mensaje */}
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-green-800">
                  {welcomeMessage}
                </p>
              </div>

              {/* Botón de continuar */}
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientTurnos;
