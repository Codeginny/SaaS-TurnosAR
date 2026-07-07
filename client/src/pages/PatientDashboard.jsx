import React, { useState, useEffect, useMemo } from 'react';
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
  Copy,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { backendAPI } from '../api/axiosInstance';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';
import { changePatientPassword } from '../services/auth';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import PaymentModal from '../components/PaymentModal';
import CommitmentModal from '../components/CommitmentModal';

const PatientDashboard = () => {
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
    hora: '',
    tipoCobertura: 'particular', // 'particular' o 'obra_social'
    nroAfiliado: ''
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
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
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
  const [paymentAmount, setPaymentAmount] = useState(30000);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [senaAmount, setSenaAmount] = useState(10000);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [mandatoryPasswordForm, setMandatoryPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [mandatoryPasswordErrors, setMandatoryPasswordErrors] = useState({});
  const [showMandatoryPasswords, setShowMandatoryPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  // Datos estáticos
  const provincias = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
    'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];

  const [profesionales, setProfesionales] = useState([]);
  const [isLoadingProfesionales, setIsLoadingProfesionales] = useState(false);

  // Clínicas dinámicas basadas en profesionales y provincia seleccionada
  const clinicas = useMemo(() => {
    const filtrados = profesionales.filter(p => {
      if (!formData.provincia) return true;
      if (!p.provincia) return false;
      return p.provincia.trim().toLowerCase() === formData.provincia.trim().toLowerCase();
    });
    
    const clinicasUnicas = [...new Set(filtrados.map(p => p.clinica || p.sanatorio).filter(Boolean))];
    return clinicasUnicas.sort();
  }, [profesionales, formData.provincia]);

  // Especialidades dinámicas basadas en profesionales, provincia y clínica
  const especialidades = useMemo(() => {
    const filtrados = profesionales.filter(p => {
      if (formData.provincia && (!p.provincia || p.provincia.trim().toLowerCase() !== formData.provincia.trim().toLowerCase())) {
        return false;
      }
      if (formData.clinica) {
        const clinicaValor = p.clinica || p.sanatorio;
        if (!clinicaValor || clinicaValor.trim().toLowerCase() !== formData.clinica.trim().toLowerCase()) {
          return false;
        }
      }
      return true;
    });
    
    const especialidadesUnicas = [...new Set(filtrados.map(p => p.especialidad).filter(Boolean))];
    return especialidadesUnicas.sort();
  }, [profesionales, formData.provincia, formData.clinica]);

  // Profesionales filtrados dinámicamente basándose en provincia, clínica y especialidad
  const profesionalesFiltrados = useMemo(() => {
    const filtrados = profesionales.filter(p => {
      if (formData.provincia && (!p.provincia || p.provincia.trim().toLowerCase() !== formData.provincia.trim().toLowerCase())) {
        return false;
      }
      if (formData.clinica) {
        const clinicaValor = p.clinica || p.sanatorio;
        if (!clinicaValor || clinicaValor.trim().toLowerCase() !== formData.clinica.trim().toLowerCase()) {
          return false;
        }
      }
      if (formData.especialidad && (!p.especialidad || p.especialidad.trim().toLowerCase() !== formData.especialidad.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
    
    return filtrados;
  }, [profesionales, formData.provincia, formData.clinica, formData.especialidad]);

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
      const prof = profesionalesFiltrados.find(p => `${p.nombre} - ${p.especialidad}` === value);
      setFormData(prev => ({ 
        ...prev, 
        profesional: value,
        fecha: '', 
        hora: '',
        provincia: prof ? (prof.provincia || prev.provincia) : prev.provincia,
        clinica: prof ? (prof.clinica || prof.sanatorio || prev.clinica) : prev.clinica,
        especialidad: prof ? (prof.especialidad || prev.especialidad) : prev.especialidad
      }));
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
    const nombreValue = userData.nombre || user?.nombre || '';
    if (!nombreValue.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreValue.trim())) {
      errors.nombre = 'El nombre solo puede contener letras y espacios';
    } else if (nombreValue.trim().length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (nombreValue.trim().length > 100) {
      errors.nombre = 'El nombre no puede exceder 100 caracteres';
    }
    
    // Validar DNI (convertir a string primero para evitar error de tipo)
    const dniString = String(userData.dni || user?.dni || '');
    if (!dniString.trim()) {
      errors.dni = 'El DNI es obligatorio';
    } else if (!/^\d{7,9}$/.test(dniString.trim())) {
      errors.dni = 'El DNI debe tener entre 7 y 9 dígitos numéricos';
    }
    
    // Validar email
    const emailValue = userData.email || user?.email || '';
    if (!emailValue.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue.trim())) {
      errors.email = 'Ingresa un email válido';
    } else if (emailValue.trim().length > 100) {
      errors.email = 'El email no puede exceder 100 caracteres';
    }
    
    // Validar teléfono
    const telefonoValue = userData.telefono || user?.telefono || '';
    if (!telefonoValue.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    } else if (telefonoValue.trim().length < 10) {
      errors.telefono = 'El teléfono debe tener al menos 10 dígitos (incluyendo código de área)';
    } else if (telefonoValue.trim().length > 20) {
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
    
    // Validar número de afiliado si es obra social
    if (formData.tipoCobertura === 'obra_social') {
      if (!formData.nroAfiliado || formData.nroAfiliado.trim() === '') {
        errors.nroAfiliado = 'El número de afiliado es obligatorio';
      } else if (formData.nroAfiliado.trim().length < 5) {
        errors.nroAfiliado = 'El número de afiliado debe tener al menos 5 caracteres';
      }
    }
    
    return errors;
  };

  // Cargar turnos del paciente
  const cargarTurnos = async () => {
    setLoadingTurnos(true);
    try {
      // Verificar que el usuario esté logueado
      if (!user?.id) {
        setTurnos([]);
        return;
      }

      // Usar el endpoint correcto para obtener turnos del paciente
      const response = await backendAPI.get(`/turnos/paciente/${user.id}`);
      
      if (response.data && Array.isArray(response.data)) {
        setTurnos(response.data);
      } else {
        setTurnos([]);
      }
    } catch (error) {
      // Manejo silencioso de 401 (el interceptor ya redirige al login)
      if (error.response?.status !== 401) {
        console.error('Error al cargar turnos:', error);
      }
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
    if (tab && ['turno', 'mis-turnos', 'perfil', 'password'].includes(tab)) {
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

  // Cargar profesionales desde la API
  useEffect(() => {
    const fetchProfesionales = async () => {
      if (!isLoadingProfesionales) {
        setIsLoadingProfesionales(true);
        try {
          const response = await backendAPI.get('/profesionales');
          const profesionalesTransformados = response.data.map(p => ({
            id: p.id,
            nombre: p.nombre,
            especialidad: p.especialidad,
            clinica: p.clinica,
            provincia: p.provincia,
            ciudad: p.ciudad
          }));
          setProfesionales(profesionalesTransformados);
        } catch (error) {
          // Manejo silencioso de 401 (el interceptor ya redirige al login)
          if (error.response?.status !== 401) {
            console.error('Error al cargar profesionales:', error);
          }
          setProfesionales([]); // Fallback: array vacío si la API falla
        } finally {
          setIsLoadingProfesionales(false);
        }
      }
    };
    fetchProfesionales();
  }, []);

  // Cargar datos del usuario desde el contexto al montar el componente
  useEffect(() => {
    const cargarDatosUsuario = async () => {
      if (user && user.id && !isLoadingUserData) {
        setIsLoadingUserData(true);
        
        // Si el usuario tiene datos básicos, usarlos y marcar como completados
        if (user.nombre && user.email && user.telefono) {
          const datosDelContexto = {
            nombre: user.nombre || '',
            email: user.email || '',
            dni: user.dni || '',
            telefono: user.telefono || '',
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
          };
          setUserData(datosDelContexto);
          setDatosCompletados(true);
        } else {
          // Si faltan datos, cargarlos desde la base de datos
          try {
            const response = await backendAPI.get(`/patient/${user.id}`);
            if (response.data) {
              const pacienteData = response.data;
              const nuevosDatos = {
                nombre: pacienteData.nombre || '',
                email: pacienteData.email || '',
                dni: pacienteData.dni || '',
                telefono: pacienteData.telefono || '',
                fechaNacimiento: pacienteData.fechaNacimiento || '',
                provincia: pacienteData.provincia || '',
                clinica: pacienteData.clinica || '',
                especialidad: pacienteData.especialidad || '',
                profesional: pacienteData.profesional || '',
                obraSocial: pacienteData.obra_social || '',
                direccion: pacienteData.direccion || '',
                localidad: pacienteData.localidad || '',
                codigoPostal: pacienteData.codigo_postal || '',
                grupoSangre: pacienteData.grupo_sangre || '',
                enfermedades: pacienteData.enfermedades || '',
                alergias: pacienteData.alergias || ''
              };
              
              setUserData(nuevosDatos);
              
              // Si después de cargar de la BD tiene los datos básicos, marcar como completados
              if (nuevosDatos.nombre && nuevosDatos.email && nuevosDatos.telefono) {
                setDatosCompletados(true);
              }
            }
          } catch (error) {
            // Manejo silencioso de 401 (el interceptor ya redirige al login)
            if (error.response?.status !== 401) {
              console.error('Error al cargar datos del usuario:', error);
            }
          }
        }
        
        setIsLoadingUserData(false);
      }
    };

    if (user && user.id) {
      cargarDatosUsuario();
    }
  }, [user]); // Solo depender del ID, no del objeto user completo

  // Calcular si los datos están completos usando useMemo para evitar bucles
  const datosCompletadosCalculados = useMemo(() => {
    // Verificar si los datos están completos en el estado local
    const datosLocalesCompletos = userData.nombre && userData.dni && userData.email && userData.telefono;
    
    // Verificar si los datos están completos en el contexto del usuario
    const datosUsuarioCompletos = user && user.nombre && user.email && user.dni;
    
    return datosLocalesCompletos || datosUsuarioCompletos;
  }, [userData.nombre, userData.dni, userData.email, userData.telefono, user]);

  // Manejar mensajes de bienvenida y estado de navegación
  useEffect(() => {
    // PRIORIDAD 1: Si debe cambiar contraseña, mostrar modal obligatorio
    if (user && user.debeCambiarClave) {
      setShowPasswordChangeModal(true);
      return;
    }
    
    // PRIORIDAD 2: Manejar mensajes de bienvenida normales
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
      
      if (esMensajeBienvenida && (!esMensajeCompletarPerfil || !datosCompletadosCalculados)) {
        setWelcomeMessage(location.state.mensaje);
        setShowWelcomeModal(true);
      }
    }
  }, [location.state, datosCompletadosCalculados, user]);

  // Sincronizar el estado con el valor calculado
  useEffect(() => {
    setDatosCompletados(datosCompletadosCalculados);
  }, [datosCompletadosCalculados]);

  // Función para validar contraseña fuerte
  const validateStrongPassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Al menos una minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Al menos un número');
    }
    return errors;
  };

  // Función para validar el formulario de cambio de contraseña obligatorio
  const validateMandatoryPasswordForm = () => {
    const errors = {};
    
    // currentPassword se completa automáticamente con user.dni, no se valida
    
    if (!mandatoryPasswordForm.newPassword) {
      errors.newPassword = 'La nueva contraseña es obligatoria';
    } else {
      const passwordErrors = validateStrongPassword(mandatoryPasswordForm.newPassword);
      if (passwordErrors.length > 0) {
        errors.newPassword = passwordErrors.join(', ');
      }
    }
    
    if (!mandatoryPasswordForm.confirmPassword) {
      errors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (mandatoryPasswordForm.newPassword !== mandatoryPasswordForm.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    // Eliminada la validación de que la nueva contraseña sea diferente a la actual
    
    setMandatoryPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Función para manejar el cambio de contraseña obligatorio
  const handleMandatoryPasswordSubmit = async () => {
    if (!validateMandatoryPasswordForm()) {
      return;
    }
    
    try {
      // currentPassword se completa automáticamente con user.dni como string
      const currentPasswordToSend = String(user.dni).trim();
      const newPasswordToSend = mandatoryPasswordForm.newPassword.trim();
      
      const payload = {
        currentPassword: currentPasswordToSend,
        newPassword: newPasswordToSend
      };
      
      await changePatientPassword(user.id, payload.currentPassword, payload.newPassword);
      
      // Actualizar el usuario en el contexto
      updateUser({ debeCambiarClave: false });
      
      // Cerrar el modal
      setShowPasswordChangeModal(false);
      
      // Limpiar el formulario
      setMandatoryPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Mostrar notificación de éxito
      addNotification({
        type: 'success',
        message: 'Contraseña actualizada. Ya puedes pedir turnos y utilizar todas las funciones de la plataforma.',
        timestamp: new Date()
      });
      
    } catch (error) {
      // Manejo silencioso de 401 (el interceptor ya redirige al login)
      if (error.response?.status !== 401) {
        console.error('Error al cambiar contraseña:', error.response?.data?.error || error.message);
      }
      setMandatoryPasswordErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      if (error.response?.status === 401) {
        setMandatoryPasswordErrors({
          currentPassword: 'La contraseña actual es incorrecta',
          newPassword: '',
          confirmPassword: ''
        });
      } else if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || 'Datos inválidos';
        if (errorMessage.includes('6 caracteres')) {
          setMandatoryPasswordErrors({
            currentPassword: '',
            newPassword: 'La contraseña debe tener al menos 6 caracteres',
            confirmPassword: ''
          });
        } else {
          setMandatoryPasswordErrors({
            currentPassword: '',
            newPassword: '',
            confirmPassword: errorMessage
          });
        }
      } else if (error.response?.status === 404) {
        setMandatoryPasswordErrors({
          currentPassword: '',
          newPassword: '',
          confirmPassword: 'Usuario no encontrado'
        });
      } else {
        setMandatoryPasswordErrors({
          currentPassword: '',
          newPassword: '',
          confirmPassword: 'Error al cambiar contraseña. Intenta nuevamente.'
        });
      }
    }
  };

  // Función para manejar cambios en el formulario de contraseña obligatorio
  const handleMandatoryPasswordChange = (e) => {
    const { name, value } = e.target;
    setMandatoryPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores al escribir
    if (mandatoryPasswordErrors[name]) {
      setMandatoryPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Función para alternar visibilidad de contraseñas obligatorias
  const toggleMandatoryPasswordVisibility = (field) => {
    setShowMandatoryPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

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
        await backendAPI.put(`/turnos/${turnoACancelar.id}`, {
          ...turnoACancelar,
          estado: 'cancelado',
          fechaCancelacion: new Date().toISOString()
        });
      } catch (turnoError) {
        console.log('Endpoint /turnos no disponible, intentando cancelar en /pacientes');
      }

      // Si no hay /turnos, cancelar en /pacientes
      try {
        await backendAPI.put(`/pacientes/${turnoACancelar.id}`, {
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
      // Manejo silencioso de 401 (el interceptor ya redirige al login)
      if (error.response?.status !== 401) {
        console.error('Error al cancelar turno:', error);
        alert('Error al cancelar el turno. Intenta nuevamente.');
      }
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
    
    // Validar que el usuario tenga datos obligatorios completados (verificar tanto user del contexto como userData local)
    const nombre = user?.nombre || userData.nombre;
    const email = user?.email || userData.email;
    const telefono = user?.telefono || userData.telefono;
    const dni = user?.dni || userData.dni;
    
    // Validación de datos del usuario
    // Validación de datos del usuario - REMOVIDO BLOQUEO (el usuario puede pedir turno si tiene DNI)
    // El backend validará si faltan datos críticos al procesar

    // Validar que el usuario haya cambiado la contraseña si es necesario
    if (user?.debeCambiarClave) {
      setSuccessMessage('🔐 Debes cambiar tu contraseña antes de pedir un turno. Ve a la pestaña "Cambiar Contraseña" y actualiza tu clave.');
      setShowSuccessModal(true);
      return;
    }
    
    // Validar turno
    const errors = validateTurno();
    if (Object.keys(errors).length > 0) {
      setTurnoErrors(errors);
      return;
    }

    // Si es particular, mostrar modal de pago
    if (formData.tipoCobertura === 'particular') {
      setPaymentAmount(30000);
      setShowPaymentModal(true);
    } else {
      // Si es obra social, mostrar modal de compromiso primero
      setShowCommitmentModal(true);
    }
  };

  const handleCommitmentConfirm = () => {
    setShowCommitmentModal(false);
    // Mostrar modal de pago con el monto de la seña
    setPaymentAmount(senaAmount);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (paymentData) => {
    setLoading(true);
    setShowPaymentModal(false);

    try {
      // Validar que el usuario tenga datos obligatorios completados
      const nombre = user?.nombre || userData.nombre;
      const email = user?.email || userData.email;
      const telefono = user?.telefono || userData.telefono;
      const dni = user?.dni || userData.dni;

      // Crear turno usando el endpoint correcto
      const turnoData = {
        provincia: formData.provincia,
        clinica: formData.clinica,
        especialidad: formData.especialidad,
        profesional: formData.profesional,
        fecha: formData.fecha,
        hora: formData.hora,
        pacienteId: String(user.id),
        pacienteNombre: nombre,
        pacienteEmail: email,
        pacienteTelefono: telefono,
        tipoCobertura: formData.tipoCobertura,
        nroAfiliado: formData.tipoCobertura === 'obra_social' ? formData.nroAfiliado : undefined,
        estadoValidacion: formData.tipoCobertura === 'obra_social' ? 'pendiente' : undefined
      };

      // Agregar campos de seña si es obra social
      if (formData.tipoCobertura === 'obra_social') {
        turnoData.montoSena = senaAmount;
        turnoData.statusSena = 'cobrada';
        // Simular payment_id de Mercado Pago (en producción vendría de la API real)
        turnoData.mercadoPagoId = paymentData ? `MP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : undefined;
      }

      if (paymentData) {
      }

      const response = await backendAPI.post('/turnos', {
        ...turnoData,
        precioConsulta: formData.tipoCobertura === 'particular' ? paymentAmount : 0
      });
      
      if (response.data) {
        setTurnoRegistrado(true);
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
          hora: '',
          tipoCobertura: 'particular',
          nroAfiliado: ''
        });
      }, 3000);
      
    } catch (error) {
      // Manejo silencioso de 401 (el interceptor ya redirige al login)
      if (error.response?.status !== 401) {
        console.error('Error al registrar turno:', error);
        alert('Error al registrar el turno. Intenta nuevamente.');
      }
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

    // Usar los mismos valores que se validaron
    const nombre = userData.nombre || user?.nombre || '';
    const email = userData.email || user?.email || '';
    const telefono = userData.telefono || user?.telefono || '';

    try {
      // Actualizar datos del paciente en el backend
      const response = await backendAPI.put(`/patient/${user.id}`, {
        nombre: nombre,
        email: email,
        telefono: telefono,
        obraSocial: userData.obraSocial,
        direccion: userData.direccion,
        provincia: userData.provincia,
        localidad: userData.localidad,
        codigoPostal: userData.codigoPostal,
        grupoSangre: userData.grupoSangre,
        enfermedades: userData.enfermedades,
        alergias: userData.alergias
      });

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
          nombre: nombre,
          email: email,
          telefono: telefono,
          dni: userData.dni || user?.dni
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
      
    } catch (error) {
      // Manejo silencioso de 401 (el interceptor ya redirige al login)
      if (error.response?.status !== 401) {
        console.error('Error al guardar datos:', error);
        alert('Error al guardar los datos. Intenta nuevamente.');
      }
    }
  };

  // Funciones para cambio de contraseña
  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'La contraseña actual es obligatoria';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'La nueva contraseña es obligatoria';
    } else {
      // Validaciones detalladas de contraseña
      const password = passwordForm.newPassword;
      const errorsList = [];

      if (password.length < 8) {
        errorsList.push('mínimo 8 caracteres');
      }
      if (!/[A-Z]/.test(password)) {
        errorsList.push('al menos una mayúscula (A-Z)');
      }
      if (!/[a-z]/.test(password)) {
        errorsList.push('al menos una minúscula (a-z)');
      }
      if (!/[0-9]/.test(password)) {
        errorsList.push('al menos un número (0-9)');
      }

      if (errorsList.length > 0) {
        errors.newPassword = `La contraseña debe tener: ${errorsList.join(', ')}`;
      }
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    try {
      // Si el usuario debe cambiar la contraseña (primera vez), usar DNI como currentPassword
      const currentPasswordToSend = user?.debeCambiarClave ? String(user.dni).trim() : passwordForm.currentPassword.trim();
      const newPasswordToSend = passwordForm.newPassword.trim();
      
      const payload = {
        currentPassword: currentPasswordToSend,
        newPassword: newPasswordToSend
      };
      
      
      await changePatientPassword(user.id, payload.currentPassword, payload.newPassword);
      
      // Actualizar el estado del usuario
      if (updateUser) {
        updateUser({
          ...user,
          debeCambiarClave: false
        });
      }

      setSuccessMessage('🔐 Contraseña cambiada exitosamente. Ya puedes solicitar turnos.');
      setShowSuccessModal(true);
      setShowPasswordForm(false);
      
      // Limpiar el formulario
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      // Manejo silencioso de 401 (el interceptor ya redirige al login)
      if (error.response?.status !== 401) {
        console.error('❌ Error al cambiar contraseña:', error);
      }
      
      // Limpiar errores previos
      setPasswordErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Mostrar error específico basado en la respuesta del servidor
      if (error.response?.status === 401) {
        setPasswordErrors({
          currentPassword: 'La contraseña actual es incorrecta',
          newPassword: '',
          confirmPassword: ''
        });
      } else if (error.response?.status === 400) {
        if (error.response?.data?.details) {
          // Mostrar detalles de validación de Zod
          const details = error.response.data.details;
          const errorMessages = details.map(d => d.message).join(', ');
          setPasswordErrors({
            currentPassword: '',
            newPassword: errorMessages,
            confirmPassword: ''
          });
        } else if (error.response?.data?.error) {
          setPasswordErrors({
            currentPassword: '',
            newPassword: error.response.data.error,
            confirmPassword: ''
          });
        } else {
          setPasswordErrors({
            currentPassword: '',
            newPassword: 'Datos inválidos. Verifica los requisitos de la contraseña.',
            confirmPassword: ''
          });
        }
      } else if (error.response?.data?.message) {
        // Mostrar mensaje del servidor
        setPasswordErrors({
          currentPassword: '',
          newPassword: error.response.data.message,
          confirmPassword: ''
        });
      } else {
        setPasswordErrors({
          currentPassword: '',
          newPassword: 'Error al cambiar la contraseña. Intenta nuevamente.',
          confirmPassword: ''
        });
      }
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 transition-colors duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Seleccionar Fecha</h3>
            <button onClick={() => setShowCalendar(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2 transition-colors duration-300">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => (
              <button
                key={index}
                onClick={() => handleDateSelect(date.toISOString().split('T')[0])}
                className={`p-2 text-sm rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors duration-300 ${
                  selectedDate === date.toISOString().split('T')[0] 
                    ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {date.getDate()}
              </button>
            ))}
          </div>
          
          {selectedDate && (
            <div className="mt-4">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white transition-colors duration-300">Horarios disponibles para {selectedDate}:</h4>
              <div className="grid grid-cols-3 gap-2">
                {availableHours.map((hour, index) => (
                  <button
                    key={index}
                    onClick={() => handleHourSelect(hour)}
                    className="p-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 transition-colors duration-300"
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
  }

  if (turnoRegistrado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-4">¡Turno creado con éxito!</h2>
          <p className="text-gray-600 mb-6">
            Tu turno ha sido registrado. Ya puedes verlo en la sección de "Mis Turnos".
          </p>
          <div className="text-sm text-gray-500 italic">
            Volviendo al panel principal...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
              {userData.nombre && userData.nombre.trim() 
                ? `Bienvenido ${userData.nombre}` 
                : 'Panel del Paciente'
              }
            </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Bienvenido a TurnosAR</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-300">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cartel para completar datos personales */}
        {!showDataForm && !datosCompletados && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 mb-8 shadow-lg transition-colors duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 transition-colors duration-300">
                  ¡Completa estos datos importantes!
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-4 transition-colors duration-300">
                  Para poder pedir el turno y que pueda llegarte la notificación, necesitamos que completes:
                </p>
                <ul className="text-blue-600 dark:text-blue-400 mb-4 space-y-1 transition-colors duration-300">
                  <li>• <strong>Nombre y Apellido</strong></li>
                  <li>• <strong>DNI</strong></li>
                  <li>• <strong>Email</strong></li>
                  <li>• <strong>Teléfono</strong></li>
                </ul>
                <button
                  onClick={() => setShowDataForm(true)}
                  className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  📝 Completar Datos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de confirmación cuando los datos están completos */}
        {!showDataForm && datosCompletados && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6 mb-8 shadow-lg transition-colors duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center shadow-md">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2 transition-colors duration-300">
                  ¡Datos Completos!
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-4 transition-colors duration-300">
                  Ya tienes todos los datos necesarios. Puedes solicitar tu turno médico cuando quieras.
                </p>
                <button
                  onClick={() => setShowDataForm(true)}
                  className="bg-green-600 dark:bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  📝 Editar Datos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de datos personales */}
        {showDataForm && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-8 mb-8 transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Completar Datos Personales</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">Haz clic en tu foto de perfil para editar estos datos</p>
              </div>
              <button
                onClick={() => setShowDataForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUserDataSubmit} className="space-y-6">
              {/* Datos Obligatorios */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6 transition-colors duration-300">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 transition-colors duration-300">📋 Datos Obligatorios</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      value={userData.nombre || user?.nombre || ''}
                      onChange={handleUserDataChange}
                      name="nombre"
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300 ${
                        userDataErrors.nombre ? 'border-red-300 dark:border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="Tu nombre completo"
                      required
                    />
                    {userDataErrors.nombre && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{userDataErrors.nombre}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      DNI *
                    </label>
                    <input
                      type="text"
                      value={userData.dni || user?.dni || ''}
                      onChange={handleUserDataChange}
                      name="dni"
                      readOnly={true}
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-80 transition-colors duration-300"
                      placeholder="12345678"
                      required
                    />
                    {userDataErrors.dni && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{userDataErrors.dni}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={userData.email || user?.email || ''}
                      onChange={handleUserDataChange}
                      name="email"
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300 ${
                        userDataErrors.email ? 'border-red-300 dark:border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="tu@email.com"
                      required
                    />
                    {userDataErrors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{userDataErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Teléfono *
                    </label>
                    <PhoneInput
                      country={'ar'}
                      onlyCountries={['ar']}
                      value={userData.telefono || user?.telefono || ''}
                      onChange={(phone) => setUserData(prev => ({ ...prev, telefono: phone }))}
                      countryCodeEditable={false}
                      disableDropdown={true}
                      inputClass={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300 ${
                        userDataErrors.telefono ? 'border-red-300 dark:border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      containerClass="w-full"
                      buttonClass="bg-white dark:bg-slate-700 border-none rounded-l-lg"
                      dropdownClass="bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      searchClass="bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="11 1234-5678"
                      required
                    />
                    {userDataErrors.telefono && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{userDataErrors.telefono}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Datos No Obligatorios */}
              <div className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 mb-6 transition-colors duration-300">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">📝 Datos No Obligatorios</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Obra Social
                    </label>
                    <input
                      type="text"
                      value={userData.obraSocial}
                      onChange={handleUserDataChange}
                      name="obraSocial"
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
                      placeholder="Ej: OSDE, Swiss Medical, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={userData.direccion}
                      onChange={handleUserDataChange}
                      name="direccion"
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
                      placeholder="Calle y número"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Provincia
                    </label>
                    <select
                      value={userData.provincia}
                      onChange={handleUserDataChange}
                      name="provincia"
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
                    >
                      <option value="">Selecciona una provincia</option>
                      {provincias.map(provincia => (
                        <option key={provincia} value={provincia}>{provincia}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Localidad
                    </label>
                    <input
                      type="text"
                      value={userData.localidad}
                      onChange={handleUserDataChange}
                      name="localidad"
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
                      placeholder="Ciudad o pueblo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={userData.codigoPostal}
                      onChange={handleUserDataChange}
                      name="codigoPostal"
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
                      placeholder="1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Grupo de Sangre
                    </label>
                    <select
                      value={userData.grupoSangre}
                      onChange={handleUserDataChange}
                      name="grupoSangre"
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Enfermedades
                    </label>
                    <textarea
                      value={userData.enfermedades}
                      onChange={handleUserDataChange}
                      name="enfermedades"
                      rows="3"
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
                      placeholder="Lista de enfermedades crónicas o condiciones médicas (opcional)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Alergias
                    </label>
                    <textarea
                      value={userData.alergias}
                      onChange={handleUserDataChange}
                      name="alergias"
                      rows="3"
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
                      placeholder="Lista de alergias conocidas (opcional)"
                    />
                  </div>
                </div>
              </div>


              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowDataForm(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
                >
                  Guardar Datos
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs de Navegación */}
        <div className="flex space-x-1 bg-white dark:bg-slate-800 p-1 rounded-lg shadow-lg mb-8 transition-colors duration-300">
          {[
            { id: 'turno', label: 'Pedir Turno', icon: Calendar },
            { id: 'mis-turnos', label: 'Mis Turnos', icon: Clock },
            { id: 'perfil', label: 'Mi Perfil', icon: User },
            { id: 'password', label: 'Cambiar Contraseña', icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenido Principal */}
        {activeTab === 'turno' && !datosCompletados && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                Completá tu perfil primero
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2 max-w-md mx-auto transition-colors duration-300">
                Para poder solicitar un turno médico, necesitás completar tus datos obligatorios: 
                <strong> nombre, email y teléfono</strong>.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                Esto nos permite contactarte y confirmar tu turno.
              </p>
              <button
                onClick={() => { setActiveTab('perfil'); setShowDataForm(true); }}
                className="px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
              >
                <User className="w-5 h-5" />
                Completar Perfil
              </button>
            </div>
          </div>
        )}

        {activeTab === 'turno' && datosCompletados && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Solicitar Turno Médico</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Cobertura */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Tipo de Cobertura
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoCobertura"
                      value="particular"
                      checked={formData.tipoCobertura === 'particular'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Particular</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoCobertura"
                      value="obra_social"
                      checked={formData.tipoCobertura === 'obra_social'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Obra Social</span>
                  </label>
                </div>
              </div>

              {/* Aviso condicional según tipo de cobertura */}
              {formData.tipoCobertura === 'particular' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        ⚠️ Particular: Pago con tarjeta de crédito o débito
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        El monto de la consulta es $30.000 ARS. Se procesará el pago al confirmar el turno.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {formData.tipoCobertura === 'obra_social' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        ℹ️ Obra Social: Validación en recepción
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Debes proporcionar tu número de afiliado. La validación se realizará al llegar a la clínica.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Número de Afiliado (solo para obra social) */}
              {formData.tipoCobertura === 'obra_social' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Número de Afiliado*
                  </label>
                  <input
                    type="text"
                    name="nroAfiliado"
                    value={formData.nroAfiliado}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300 ${
                      turnoErrors.nroAfiliado ? 'border-red-300 dark:border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                    placeholder="Ingresa tu número de afiliado"
                    required
                  />
                  {turnoErrors.nroAfiliado && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{turnoErrors.nroAfiliado}</p>
                  )}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Provincia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Provincia
                  </label>
                  <select
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300 ${
                      turnoErrors.provincia ? 'border-red-300 dark:border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                    required
                  >
                    <option value="">Todas las provincias</option>
                    {provincias.map(provincia => (
                      <option key={provincia} value={provincia}>{provincia}</option>
                    ))}
                  </select>
                  {turnoErrors.provincia && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{turnoErrors.provincia}</p>
                  )}
                </div>

                {/* Clínica */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Clínica o Consultorio
                  </label>
                  <select
                    name="clinica"
                    value={formData.clinica}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300 ${
                      turnoErrors.clinica ? 'border-red-300 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                    required
                  >
                    <option value="">Todas las clínicas o consultorios</option>
                    {clinicas.map(clinica => (
                      <option key={clinica} value={clinica}>{clinica}</option>
                    ))}
                  </select>
                  {turnoErrors.clinica && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{turnoErrors.clinica}</p>
                  )}
                </div>

                {/* Especialidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    <Stethoscope className="w-4 h-4 inline mr-2" />
                    Especialidad
                  </label>
                  <select
                    name="especialidad"
                    value={formData.especialidad}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300 ${
                      turnoErrors.especialidad ? 'border-red-300 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                    required
                  >
                    <option value="">Todas las especialidades</option>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    <User className="w-4 h-4 inline mr-2" />
                    Profesional
                  </label>
                  <select
                    name="profesional"
                    value={formData.profesional}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors duration-300 ${
                      turnoErrors.profesional ? 'border-red-300 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                    required
                    disabled={!formData.especialidad || isLoadingProfesionales}
                  >
                    <option value="">
                      {isLoadingProfesionales ? 'Cargando red médica...' : 'Selecciona un profesional'}
                    </option>
                    {profesionalesFiltrados.length > 0 ? (
                      profesionalesFiltrados.map(profesional => (
                        <option key={profesional.id} value={`${profesional.nombre} - ${profesional.especialidad}`}>
                          {profesional.nombre} - {profesional.especialidad}
                        </option>
                      ))
                    ) : (
                      <option disabled>No hay profesionales disponibles con estos filtros</option>
                    )}
                  </select>
                  {turnoErrors.profesional && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{turnoErrors.profesional}</p>
                  )}
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha
                  </label>
                  <button
                    type="button"
                    onClick={handleProfesionalSelect}
                    disabled={!formData.profesional}
                    className={`w-full border rounded-lg px-4 py-3 text-left bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 ${
                      turnoErrors.fecha ? 'border-red-300 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                  >
                    {formData.fecha || 'Selecciona fecha y hora'}
                  </button>
                  {turnoErrors.fecha && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{turnoErrors.fecha}</p>
                  )}
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Hora
                  </label>
                  <input
                    type="text"
                    value={formData.hora}
                    readOnly
                    className={`w-full border rounded-lg px-4 py-3 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300 ${
                      turnoErrors.hora ? 'border-red-300 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                    placeholder="Se selecciona con la fecha"
                  />
                  {turnoErrors.hora && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{turnoErrors.hora}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.fecha || !formData.hora}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Mis Turnos</h2>
              <button
                onClick={cargarTurnos}
                disabled={loadingTurnos}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
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
                <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Cargando turnos...</p>
              </div>
            ) : turnos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">No tienes turnos programados</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">Cuando solicites un turno, aparecerá aquí</p>
                <button
                  onClick={() => setActiveTab('turno')}
                  className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  Solicitar Turno
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {turnos.map((turno, index) => (
                  <div key={index} className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center shadow-md">
                            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                              {turno.especialidad || 'Especialidad médica'}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                              {turno.profesional || 'Profesional'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Clínica o Consultorio:</span>
                            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{turno.clinica || 'No especificada'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Provincia:</span>
                            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{turno.provincia || 'No especificada'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Fecha:</span>
                            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                              {turno.fecha ? new Date(turno.fecha).toLocaleDateString('es-AR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 'No especificada'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Hora:</span>
                            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{turno.hora || 'No especificada'}</p>
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl p-8 transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Mi Perfil</h2>
              <button
                onClick={() => setShowDataForm(true)}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
              >
                {datosCompletados ? 'Editar Perfil' : 'Completar Perfil'}
              </button>
            </div>
            
            {datosCompletados ? (
              <div className="space-y-6">
                {/* Datos Obligatorios */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 transition-colors duration-300">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2 transition-colors duration-300">
                    <span>📋</span>
                    Datos Obligatorios
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300 transition-colors duration-300">Nombre completo:</span>
                      <p className="text-blue-900 dark:text-blue-100 font-semibold transition-colors duration-300">{userData.nombre || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300 transition-colors duration-300">DNI:</span>
                      <p className="text-blue-900 dark:text-blue-100 font-semibold transition-colors duration-300">{userData.dni || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300 transition-colors duration-300">Email:</span>
                      <p className="text-blue-900 dark:text-blue-100 font-semibold transition-colors duration-300">{userData.email || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300 transition-colors duration-300">Teléfono:</span>
                      <p className="text-blue-900 dark:text-blue-100 font-semibold transition-colors duration-300">{userData.telefono || 'No especificado'}</p>
                    </div>
                  </div>
                </div>

                {/* Datos No Obligatorios */}
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-6 transition-colors duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
                    <span>📝</span>
                    Datos No Obligatorios
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Obra social:</span>
                      <p className="text-gray-900 dark:text-white transition-colors duration-300">{userData.obraSocial || 'No especificada'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Dirección:</span>
                      <p className="text-gray-900 dark:text-white transition-colors duration-300">{userData.direccion || 'No especificada'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Provincia:</span>
                      <p className="text-gray-900 dark:text-white transition-colors duration-300">{userData.provincia || 'No especificada'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Localidad:</span>
                      <p className="text-gray-900 dark:text-white transition-colors duration-300">{userData.localidad || 'No especificada'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Código postal:</span>
                      <p className="text-gray-900 dark:text-white transition-colors duration-300">{userData.codigoPostal || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Grupo de sangre:</span>
                      <p className="text-gray-900 dark:text-white transition-colors duration-300">{userData.grupoSangre || 'No especificado'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Enfermedades:</span>
                      <p className="text-gray-900 dark:text-white transition-colors duration-300">{userData.enfermedades || 'No especificadas'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Alergias:</span>
                      <p className="text-gray-900 dark:text-white transition-colors duration-300">{userData.alergias || 'No especificadas'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                  <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">Perfil incompleto</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300">Completa tu información personal para acceder a todas las funcionalidades</p>
                <button
                  onClick={() => setShowDataForm(true)}
                  className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
                >
                  Completar Perfil
                </button>
              </div>
            )}
          </div>
        )}


        
        {/* Pestaña de Bancos */}

        {/* Pestaña de Cambiar Contraseña */}
        {activeTab === 'password' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300 flex items-center">
              <Lock className="w-7 h-7 mr-3" />
              Cambiar Contraseña
            </h2>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-6 transition-colors duration-300">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Para tu seguridad, te recomendamos cambiar tu contraseña regularmente.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                La nueva contraseña debe tener al menos 6 caracteres.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Contraseña Actual *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.currentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    name="currentPassword"
                    className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300 ${
                      passwordErrors.currentPassword ? 'border-red-300 dark:border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                    placeholder="Tu contraseña actual"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('currentPassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-300"
                  >
                    {showPasswords.currentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    name="newPassword"
                    className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300 ${
                      passwordErrors.newPassword ? 'border-red-300 dark:border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('newPassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-300"
                  >
                    {showPasswords.newPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Confirmar Nueva Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    name="confirmPassword"
                    className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300 ${
                      passwordErrors.confirmPassword ? 'border-red-300 dark:border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                    placeholder="Repite tu nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-300"
                  >
                    {showPasswords.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                onClick={handlePasswordSubmit}
                className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 flex items-center"
              >
                <Lock className="w-5 h-5 mr-2" />
                Cambiar Contraseña
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Calendario Modal */}
      {renderCalendar()}

      {/* Modal de Éxito/Error */}
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
              {/* Detectar si es mensaje de error o éxito */}
              {successMessage.includes('⚠️') || successMessage.includes('Debes completar') || successMessage.includes('Debes cambiar') ? (
                // Modal de Error/Advertencia
                <>
                  {/* Icono de advertencia */}
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <X className="w-12 h-12 text-red-600" />
                  </div>
                  
                  {/* Título */}
                  <h3 className="text-2xl font-bold text-red-700 mb-4">
                    ¡Atención!
                  </h3>
                  
                  {/* Mensaje */}
                  <p className="text-gray-600 mb-8 text-lg">
                    {successMessage}
                  </p>
                  
                  {/* Botón de cerrar */}
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Entendido
                  </button>
                </>
              ) : (
                // Modal de Éxito
                <>
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
                </>
              )}
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
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-6 text-left transition-colors duration-300">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Detalles del turno:</h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
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

      {/* Modal de Cambio de Contraseña Obligatorio */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-6">
                {/* Icono de seguridad */}
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-12 h-12 text-red-600" />
                </div>
                
                {/* Título */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  ¡Cambio de Contraseña Obligatorio!
                </h3>
                
                {/* Mensaje principal */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Por seguridad, asigná una nueva contraseña personalizada para tu cuenta.
                  </p>
                </div>

                {/* Requisitos de seguridad */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                    Requisitos de la contraseña:
                  </h4>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Mínimo 8 caracteres</li>
                    <li>• Al menos una letra mayúscula (A-Z)</li>
                    <li>• Al menos una letra minúscula (a-z)</li>
                    <li>• Al menos un número (0-9)</li>
                  </ul>
                </div>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                {/* Nueva Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showMandatoryPasswords.newPassword ? "text" : "password"}
                      name="newPassword"
                      value={mandatoryPasswordForm.newPassword}
                      onChange={handleMandatoryPasswordChange}
                      className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                        mandatoryPasswordErrors.newPassword ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="Tu nueva contraseña segura"
                    />
                    <button
                      type="button"
                      onClick={() => toggleMandatoryPasswordVisibility('newPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showMandatoryPasswords.newPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {mandatoryPasswordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{mandatoryPasswordErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirmar Nueva Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmar Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showMandatoryPasswords.confirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={mandatoryPasswordForm.confirmPassword}
                      onChange={handleMandatoryPasswordChange}
                      className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                        mandatoryPasswordErrors.confirmPassword ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                      placeholder="Confirma tu nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => toggleMandatoryPasswordVisibility('confirmPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showMandatoryPasswords.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {mandatoryPasswordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{mandatoryPasswordErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Botón de cambiar contraseña */}
                <button
                  type="button"
                  onClick={handleMandatoryPasswordSubmit}
                  className="w-full bg-red-600 dark:bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Cambiar Contraseña Ahora
                </button>

                {/* Mensaje de advertencia */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <p className="text-xs text-red-700 dark:text-red-300 text-center">
                    ⚠️ No podrás usar la plataforma hasta que cambies tu contraseña
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        amount={paymentAmount}
        currency="ARS"
      />

      {/* Modal de Compromiso de Asistencia */}
      <CommitmentModal
        isOpen={showCommitmentModal}
        onClose={() => setShowCommitmentModal(false)}
        onConfirm={handleCommitmentConfirm}
        senaAmount={senaAmount}
      />
    </div>
  );
};

export default PatientDashboard;
