import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import SecurityService from '../services/securityService';

const PasswordStrengthIndicator = ({ 
  password, 
  onPasswordChange, 
  showToggle = true,
  placeholder = "Ingresa tu contraseña",
  label = "Contraseña",
  required = true,
  minLength = 8,
  className = "",
  userData = {},
  showGenerateButton = true
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(null);

  useEffect(() => {
    if (password) {
      const validation = SecurityService.validatePasswordStrength(password, userData);
      setStrength(validation);
    } else {
      setStrength(null);
    }
  }, [password, userData]);

  const getStrengthColor = (level) => {
    switch (level) {
      case 'excelente':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'buena':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'aceptable':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'débil':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStrengthIcon = (level) => {
    switch (level) {
      case 'excelente':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'buena':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'aceptable':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'débil':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Lock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStrengthText = (level) => {
    switch (level) {
      case 'excelente':
        return 'Excelente';
      case 'buena':
        return 'Buena';
      case 'aceptable':
        return 'Aceptable';
      case 'débil':
        return 'Débil';
      default:
        return 'Ingresa contraseña';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        <Lock className="w-4 h-4 inline mr-2" />
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
            strength && !strength.isValid ? 'border-red-300 focus:ring-red-300 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder={placeholder}
          minLength={minLength}
          required={required}
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Indicador de fortaleza */}
      {strength && password && (
        <div className={`rounded-lg p-3 border ${getStrengthColor(strength.level)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStrengthIcon(strength.level)}
              <span className="font-medium text-sm">
                Fortaleza: {getStrengthText(strength.level)}
              </span>
            </div>
            
            {showGenerateButton && (
              <button
                type="button"
                onClick={() => {
                  const generatedPassword = SecurityService.generateSecurePassword(12);
                  onPasswordChange(generatedPassword);
                }}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
              >
                🔐 Generar
              </button>
            )}
          </div>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                strength.level === 'excelente' ? 'bg-green-500' :
                strength.level === 'buena' ? 'bg-blue-500' :
                strength.level === 'aceptable' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${(strength.score / 7) * 100}%` }}
            ></div>
          </div>

          {/* Requisitos individuales */}
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Requisitos de seguridad:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className={`flex items-center gap-1 ${strength.requirements.length ? 'text-green-600' : 'text-red-600'}`}>
                {strength.requirements.length ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {password.length >= 8 ? '✓ 8+ caracteres' : '✗ 8+ caracteres'}
              </div>
              <div className={`flex items-center gap-1 ${strength.requirements.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                {strength.requirements.lowercase ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {strength.requirements.lowercase ? '✓ Minúscula' : '✗ Minúscula'}
              </div>
              <div className={`flex items-center gap-1 ${strength.requirements.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                {strength.requirements.uppercase ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {strength.requirements.uppercase ? '✓ Mayúscula' : '✗ Mayúscula'}
              </div>
              <div className={`flex items-center gap-1 ${strength.requirements.numbers ? 'text-green-600' : 'text-red-600'}`}>
                {strength.requirements.numbers ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {strength.requirements.numbers ? '✓ Número' : '✗ Número'}
              </div>
              <div className={`flex items-center gap-1 ${strength.requirements.symbols ? 'text-green-600' : 'text-red-600'}`}>
                {strength.requirements.symbols ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {strength.requirements.symbols ? '✓ Símbolo' : '✗ Símbolo'}
              </div>
              <div className={`flex items-center gap-1 ${strength.requirements.notDNI ? 'text-green-600' : 'text-red-600'}`}>
                {strength.requirements.notDNI ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {strength.requirements.notDNI ? '✓ ≠ DNI' : '✗ ≠ DNI'}
              </div>
            </div>
          </div>

          {/* Errores */}
          {strength.errors.length > 0 && (
            <div className="mb-2">
              {strength.errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Advertencias */}
          {strength.warnings.length > 0 && (
            <div className="mb-2">
              {strength.warnings.map((warning, index) => (
                <p key={index} className="text-sm text-yellow-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {warning}
                </p>
              ))}
            </div>
          )}

          {/* Recomendaciones */}
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">Recomendaciones:</p>
            <ul className="list-disc list-inside space-y-1">
              {SecurityService.getSecurityInfo().recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

                {/* Información de seguridad */}
          <div className="text-xs text-gray-500 bg-blue-50 rounded-lg p-3">
            <p className="font-medium text-blue-800 mb-1">🔐 Seguridad Garantizada</p>
            <p className="text-blue-700 mb-2">
              {SecurityService.getSecurityInfo().description}
            </p>
            <div className="text-blue-600">
              <p className="font-medium mb-1">Requisitos mínimos:</p>
              <ul className="list-disc list-inside space-y-1">
                {SecurityService.getSecurityInfo().requirements.slice(0, 5).map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
