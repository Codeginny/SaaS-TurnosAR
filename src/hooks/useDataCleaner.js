import { useCallback } from 'react';
import DataCleanerService from '../services/dataCleanerService';

/**
 * Hook personalizado para usar el servicio de limpieza de datos
 * Proporciona funciones convenientes para limpiar datos antes de enviarlos a la API
 */
export const useDataCleaner = () => {
  
  /**
   * Limpia datos de paciente
   */
  const cleanPacienteData = useCallback((data) => {
    return DataCleanerService.cleanPacienteData(data);
  }, []);

  /**
   * Limpia datos de profesional
   */
  const cleanProfesionalData = useCallback((data) => {
    return DataCleanerService.cleanProfesionalData(data);
  }, []);

  /**
   * Limpia datos de turno
   */
  const cleanTurnoData = useCallback((data) => {
    return DataCleanerService.cleanTurnoData(data);
  }, []);

  /**
   * Limpia datos de formulario genérico
   */
  const cleanFormData = useCallback((data, requiredFields = []) => {
    return DataCleanerService.cleanFormData(data, requiredFields);
  }, []);

  /**
   * Prepara datos para envío a API (versión estricta)
   */
  const prepareForAPI = useCallback((data) => {
    return DataCleanerService.prepareForAPI(data);
  }, []);

  /**
   * Prepara datos para almacenamiento local (versión conservadora)
   */
  const prepareForStorage = useCallback((data) => {
    return DataCleanerService.prepareForStorage(data);
  }, []);

  /**
   * Restaura datos de la API para formularios
   */
  const restoreFromAPI = useCallback((data) => {
    return DataCleanerService.restoreFromAPI(data);
  }, []);

  /**
   * Compara dos objetos ignorando campos vacíos
   */
  const compareIgnoringEmpty = useCallback((obj1, obj2) => {
    return DataCleanerService.compareIgnoringEmpty(obj1, obj2);
  }, []);

  /**
   * Verifica si un valor está vacío
   */
  const isEmptyValue = useCallback((value) => {
    return DataCleanerService.isEmptyValue(value);
  }, []);

  return {
    cleanPacienteData,
    cleanProfesionalData,
    cleanTurnoData,
    cleanFormData,
    prepareForAPI,
    prepareForStorage,
    restoreFromAPI,
    compareIgnoringEmpty,
    isEmptyValue
  };
};

export default useDataCleaner;
