import Layout from './Layout';

export default {
  title: 'Components/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Componente principal de layout que incluye la navegación y estructura base de la aplicación.',
      },
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Contenido que se renderiza dentro del layout',
    },
  },
  tags: ['autodocs'],
};

// Story básico
export const Default = {
  args: {
    children: <div className="p-8 text-center">Contenido de la página</div>,
  },
};

// Story con contenido largo
export const WithLongContent = {
  args: {
    children: (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Título de la Página</h1>
        <p className="mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p className="mb-4">
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-gray-100 p-4 rounded">
              Card {item}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

// Story con modo oscuro
export const DarkMode = {
  args: {
    children: <div className="p-8 text-center dark:text-white">Contenido en modo oscuro</div>,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// Story responsive
export const Mobile = {
  args: {
    children: <div className="p-4 text-center">Vista móvil</div>,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
};

// Story con navegación activa
export const WithActiveNavigation = {
  args: {
    children: <div className="p-8 text-center">Página con navegación activa</div>,
  },
  play: async ({ canvasElement }) => {
    // Simular navegación activa
    const canvas = within(canvasElement);
    // Aquí podrías agregar interacciones si es necesario
  },
};
