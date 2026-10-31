import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import App from '../App';
import { StorageService } from '../services/storageService';

describe('Mandatory Login Guard - Bloqueo de Calculadora de Propinas sin Login', () => {
  let storageService: StorageService;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    storageService = StorageService.getInstance();
    await storageService.initDefaultData();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no debe mostrar ni permitir usar la calculadora de propinas si no se ha iniciado sesión', () => {
    // Al abrir la app sin sesión previa en sessionStorage
    render(<App />);

    // Debe mostrar la pantalla de Iniciar Sesión de forma obligatoria
    expect(screen.getAllByRole('heading', { name: /Iniciar Sesión/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText(/Nombre de usuario/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeDefined();

    // La calculadora de propinas NO debe estar presente en el DOM
    expect(screen.queryByText(/Cálculo de Propinas/i)).toBeNull();
    expect(screen.queryByText(/Monto Total Recaudado/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /Calcular Distribución/i })).toBeNull();
    expect(screen.queryByText(/No hay sesión activa/i)).toBeNull();
  });

  it('no debe mostrar accesos directos de administración ni recarga de garzones en la cabecera cuando no hay sesión', () => {
    render(<App />);

    // No debe existir el botón de recargar garzones ni el engranaje de configuración
    expect(screen.queryByTitle(/Recargar garzones/i)).toBeNull();
    expect(screen.queryByTitle(/Configuración/i)).toBeNull();
    // Debe mostrar el subtítulo de acceso requerido
    expect(screen.getByText(/Acceso Requerido/i)).toBeDefined();
  });

  it('debe desbloquear la calculadora de propinas una vez que se inicia sesión exitosamente', async () => {
    // Simulamos un usuario autenticado que ya tiene su contraseña actualizada
    const usuarioGarzon = {
      id: 'garzon-1',
      nombre: 'ana',
      rol: 'garzon' as const,
      debeCambiarContrasena: false,
    };
    sessionStorage.setItem('calculadora_usuario_sesion', JSON.stringify(usuarioGarzon));

    render(<App />);

    // Ahora sí debe mostrarse la calculadora de propinas
    expect(screen.getByText(/Cálculo de Propinas/i)).toBeDefined();
    expect(screen.getByText(/Monto Total Recaudado/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Calcular Distribución/i })).toBeDefined();

    // Debe mostrar la información de sesión activa
    expect(screen.getByText(/Sesión activa: ana/i)).toBeDefined();
  });

  it('al cerrar sesión debe volver inmediatamente a la pantalla de login y ocultar la calculadora', async () => {
    const usuarioAdmin = {
      id: 'admin-1',
      nombre: 'admin',
      rol: 'admin' as const,
      debeCambiarContrasena: false,
    };
    sessionStorage.setItem('calculadora_usuario_sesion', JSON.stringify(usuarioAdmin));

    render(<App />);

    // Verificamos que la calculadora está visible inicialmente
    expect(screen.getByText(/Cálculo de Propinas/i)).toBeDefined();

    // Presionamos el botón "Salir" en el Header
    const botonSalir = screen.getByTitle(/Cerrar sesión de admin/i);
    await act(async () => {
      botonSalir.click();
    });

    // La calculadora debe haber desaparecido y la pantalla de Login debe estar visible
    expect(screen.queryByText(/Cálculo de Propinas/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /Calcular Distribución/i })).toBeNull();
    expect(screen.getAllByRole('heading', { name: /Iniciar Sesión/i }).length).toBeGreaterThanOrEqual(1);
  });
});
