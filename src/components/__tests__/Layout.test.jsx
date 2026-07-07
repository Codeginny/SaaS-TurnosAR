import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';

// Mock de los contextos
const mockUserContext = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'patient'
  },
  login: jest.fn(),
  logout: jest.fn()
};

const mockNotificationContext = {
  notifications: [],
  addNotification: jest.fn(),
  removeNotification: jest.fn(),
  markAsRead: jest.fn()
};

// Wrapper para proporcionar contextos
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock de los contextos
jest.mock('../../context/UserContext', () => ({
  useUser: () => mockUserContext
}));

jest.mock('../../context/NotificationContext', () => ({
  useNotifications: () => mockNotificationContext
}));

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar el header correctamente', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    // Verificar que el header esté presente
    expect(screen.getByRole('banner')).toBeInTheDocument();
    
    // Verificar elementos del header
    expect(screen.getByText('TurnosAR')).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Planes')).toBeInTheDocument();
    expect(screen.getByText('Preguntas Frecuentes')).toBeInTheDocument();
    expect(screen.getByText('Contacto')).toBeInTheDocument();
  });

  it('debería renderizar el contenido principal', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('debería mostrar el botón "Soy Profesional" cuando no hay usuario logueado', () => {
    mockUserContext.user = null;
    
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    expect(screen.getByText('Soy Profesional')).toBeInTheDocument();
  });

  it('debería mostrar el avatar del usuario cuando está logueado', () => {
    mockUserContext.user = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'patient'
    };
    
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    // Verificar que el avatar esté presente
    expect(screen.getByAltText('Avatar de Test User')).toBeInTheDocument();
  });

  it('debería tener navegación responsive', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    // Verificar que el botón de menú móvil esté presente
    const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
    expect(mobileMenuButton).toBeInTheDocument();
  });

  it('debería aplicar clases de Tailwind correctamente', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white', 'shadow-md', 'dark:bg-gray-800');
  });

  it('debería manejar el modo oscuro correctamente', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    // Verificar que las clases dark: estén presentes
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('dark:bg-gray-800');
  });

  it('debería tener enlaces de navegación válidos', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    const homeLink = screen.getByText('Inicio').closest('a');
    const plansLink = screen.getByText('Planes').closest('a');
    const faqLink = screen.getByText('Preguntas Frecuentes').closest('a');
    const contactLink = screen.getByText('Contacto').closest('a');
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(plansLink).toHaveAttribute('href', '/precios');
    expect(faqLink).toHaveAttribute('href', '/faq');
    expect(contactLink).toHaveAttribute('href', '/contacto');
  });

  it('debería renderizar el footer correctamente', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    // Verificar que el footer esté presente
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('debería ser accesible', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    // Verificar roles ARIA
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    
    // Verificar navegación
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
