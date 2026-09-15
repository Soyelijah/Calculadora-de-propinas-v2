import React, { useEffect } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AppProvider, useApp } from '../context/AppContext';
import { StorageService } from '../services/storageService';

// Test component to validate Route Guard behavior in integration
const TestGuardComponent: React.FC = () => {
  const { currentScreen, setCurrentScreen, showNotification, notification } = useApp();
  const { usuarioActual, sesionActiva } = useAuth();

  useEffect(() => {
    // Exact guard logic matching App.tsx
    if (sesionActiva && usuarioActual?.debeCambiarContrasena && currentScreen !== 'cambiar-contrasena') {
      showNotification('Debe actualizar su contraseña obligatoriamente antes de continuar', 'error');
      setCurrentScreen('cambiar-contrasena');
    }
  }, [currentScreen, sesionActiva, usuarioActual, setCurrentScreen, showNotification]);

  return (
    <div>
      <div data-testid="screen-name">{currentScreen}</div>
      {notification && <div data-testid="toast-notification">{notification.message}</div>}
      <button onClick={() => setCurrentScreen('home')} data-testid="go-home-btn">
        Ir a Home
      </button>
      <button onClick={() => setCurrentScreen('historial')} data-testid="go-historial-btn">
        Ir a Historial
      </button>
    </div>
  );
};

describe('AuthContext - Pruebas Unitarias Exhaustivas', () => {
  let storageService: StorageService;

  beforeEach(async () => {
    // Clear storage mocks
    localStorage.clear();
    sessionStorage.clear();
    storageService = StorageService.getInstance();
    // Initialize default credentials
    await storageService.initDefaultData();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('1. Estados de Inicio de Sesión y Cierre de Sesión', () => {
    it('debe iniciar con estado no autenticado por defecto', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current.usuarioActual).toBeNull();
      expect(result.current.sesionActiva).toBe(false);
      expect(result.current.errorMensaje).toBeNull();
      expect(result.current.alertaExpiracionVisible).toBe(false);
      expect(result.current.motivoExpiracion).toBeNull();
    });

    it('debe restaurar automáticamente la sesión guardada en sessionStorage', () => {
      const mockUser = {
        id: 'user-admin-1',
        nombre: 'admin',
        rol: 'admin' as const,
        debeCambiarContrasena: false,
      };
      sessionStorage.setItem('calculadora_usuario_sesion', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current.sesionActiva).toBe(true);
      expect(result.current.usuarioActual).not.toBeNull();
      expect(result.current.usuarioActual?.nombre).toBe('admin');
      expect(result.current.usuarioActual?.rol).toBe('admin');
    });

    it('debe autenticar exitosamente con credenciales válidas y persistir en sessionStorage', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      let loginSuccess = false;
      await act(async () => {
        loginSuccess = await result.current.iniciarSesion('admin', 'admin123');
      });

      expect(loginSuccess).toBe(true);
      expect(result.current.sesionActiva).toBe(true);
      expect(result.current.usuarioActual).not.toBeNull();
      expect(result.current.usuarioActual?.nombre.toLowerCase()).toBe('admin');
      expect(result.current.usuarioActual?.rol).toBe('admin');
      expect(result.current.errorMensaje).toBeNull();

      // Session storage persistence check
      const stored = sessionStorage.getItem('calculadora_usuario_sesion');
      expect(stored).not.toBeNull();
      const parsedStored = JSON.parse(stored!);
      expect(parsedStored.nombre.toLowerCase()).toBe('admin');
    });

    it('debe rechazar credenciales incorrectas y exponer mensaje de error descriptivo', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      let loginSuccess = false;
      await act(async () => {
        loginSuccess = await result.current.iniciarSesion('admin', 'clave_erronea');
      });

      expect(loginSuccess).toBe(false);
      expect(result.current.sesionActiva).toBe(false);
      expect(result.current.usuarioActual).toBeNull();
      expect(result.current.errorMensaje).not.toBeNull();
      expect(result.current.errorMensaje).toContain('Usuario o contraseña incorrectos');
      expect(sessionStorage.getItem('calculadora_usuario_sesion')).toBeNull();
    });

    it('debe cerrar sesión adecuadamente, limpiando sessionStorage y restableciendo el estado', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // Primero iniciar sesión
      await act(async () => {
        await result.current.iniciarSesion('admin', 'admin123');
      });
      expect(result.current.sesionActiva).toBe(true);
      expect(sessionStorage.getItem('calculadora_usuario_sesion')).not.toBeNull();

      // Luego cerrar sesión
      act(() => {
        result.current.cerrarSesion('Cierre voluntario en test');
      });

      expect(result.current.sesionActiva).toBe(false);
      expect(result.current.usuarioActual).toBeNull();
      expect(sessionStorage.getItem('calculadora_usuario_sesion')).toBeNull();
      expect(result.current.alertaExpiracionVisible).toBe(false);
      expect(result.current.motivoExpiracion).toBeNull();
    });
  });

  describe('2. Guard de Cambio de Contraseña Forzado (Forced Password Change Guard)', () => {
    it('debe identificar correctamente la bandera debeCambiarContrasena en las credenciales por defecto', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
        await result.current.iniciarSesion('admin', 'admin123');
      });

      // Default initial admin account has debeCambiarContrasena = true
      expect(result.current.usuarioActual?.debeCambiarContrasena).toBe(true);
    });

    it('debe interceptar y redirigir a "cambiar-contrasena" si el usuario tiene cambio forzado pendiente', async () => {
      // Iniciar sesión con usuario que debe cambiar contraseña
      const userWithPendingPasswordChange = {
        id: 'user-admin-1',
        nombre: 'admin',
        rol: 'admin' as const,
        debeCambiarContrasena: true,
      };
      sessionStorage.setItem('calculadora_usuario_sesion', JSON.stringify(userWithPendingPasswordChange));

      render(
        <AuthProvider>
          <AppProvider>
            <TestGuardComponent />
          </AppProvider>
        </AuthProvider>
      );

      // El guard debe haber redirigido a 'cambiar-contrasena'
      const screenElem = screen.getByTestId('screen-name');
      expect(screenElem.textContent).toBe('cambiar-contrasena');

      // Debe emitir la notificación de advertencia obligatoria
      const notificationElem = screen.getByTestId('toast-notification');
      expect(notificationElem.textContent).toContain('Debe actualizar su contraseña obligatoriamente');

      // Intentar navegar a otra pantalla debe ser bloqueado y re-redirigido
      const goHomeBtn = screen.getByTestId('go-home-btn');
      act(() => {
        goHomeBtn.click();
      });

      expect(screen.getByTestId('screen-name').textContent).toBe('cambiar-contrasena');
    });

    it('debe permitir navegar libremente una vez que debeCambiarContrasena es false', async () => {
      const userWithoutPendingPasswordChange = {
        id: 'user-garzon-1',
        nombre: 'garzon1',
        rol: 'garzon' as const,
        debeCambiarContrasena: false,
      };
      sessionStorage.setItem('calculadora_usuario_sesion', JSON.stringify(userWithoutPendingPasswordChange));

      render(
        <AuthProvider>
          <AppProvider>
            <TestGuardComponent />
          </AppProvider>
        </AuthProvider>
      );

      // Debe permanecer en la pantalla inicial ('home') sin ser forzado a cambiar contraseña
      expect(screen.getByTestId('screen-name').textContent).toBe('home');

      // Puede navegar a Historial sin ser interceptado
      const goHistorialBtn = screen.getByTestId('go-historial-btn');
      act(() => {
        goHistorialBtn.click();
      });

      expect(screen.getByTestId('screen-name').textContent).toBe('historial');
    });
  });

  describe('3. Temporizadores de Expiración de Sesión (Dual Timers, Alerta y Expiración)', () => {
    it('debe inicializar los temporizadores de acuerdo a la configuración predeterminada', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // Default configuration is 30 mins max (1800s) and 15 mins inactivity (900s)
      expect(result.current.tiempoMaximoRestante).toBe(1800);
      expect(result.current.tiempoInactividadRestante).toBe(900);
    });

    it('debe decrementar el temporizador con el paso del tiempo mientras la sesión está activa', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // Iniciar sesión
      await act(async () => {
        await result.current.iniciarSesion('admin', 'admin123');
      });

      expect(result.current.sesionActiva).toBe(true);
      const tiempoInactividadInicial = result.current.tiempoInactividadRestante;

      // Avanzar 5 segundos
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.tiempoInactividadRestante).toBe(tiempoInactividadInicial - 5);
      expect(result.current.tiempoMaximoRestante).toBe(1800 - 5);
    });

    it('debe refrescar el tiempo de inactividad cuando el usuario interactúa (evento en window)', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
        await result.current.iniciarSesion('admin', 'admin123');
      });

      // Avanzar 10 segundos
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(result.current.tiempoInactividadRestante).toBe(890);

      // Disparar evento de interacción del usuario
      act(() => {
        window.dispatchEvent(new MouseEvent('mousemove'));
      });

      // Avanzar 1 segundo para que el bucle del timer registre el nuevo timestamp
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // El tiempo de inactividad debe haberse refrescado
      expect(result.current.tiempoInactividadRestante).toBeGreaterThanOrEqual(898);
    });

    it('debe activar la alerta preventiva cuando el tiempo restante es menor o igual a 60 segundos', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
        await result.current.iniciarSesion('admin', 'admin123');
      });

      expect(result.current.alertaExpiracionVisible).toBe(false);

      // Avanzar tiempo hasta que resten 60 segundos de inactividad (900 - 840 = 60)
      act(() => {
        vi.advanceTimersByTime(840 * 1000);
      });

      expect(result.current.alertaExpiracionVisible).toBe(true);
      expect(result.current.motivoExpiracion).toBe('inactividad');
      expect(result.current.tiempoInactividadRestante).toBeLessThanOrEqual(60);
    });

    it('debe extender la sesión y ocultar la alerta al invocar extenderSesion()', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
        await result.current.iniciarSesion('admin', 'admin123');
      });

      // Avanzar a zona de advertencia (850s transcurridos, restan 50s)
      act(() => {
        vi.advanceTimersByTime(850 * 1000);
      });
      expect(result.current.alertaExpiracionVisible).toBe(true);

      // Usuario presiona botón para extender sesión
      act(() => {
        result.current.extenderSesion();
      });

      expect(result.current.alertaExpiracionVisible).toBe(false);
      expect(result.current.motivoExpiracion).toBeNull();
      expect(result.current.tiempoInactividadRestante).toBe(900);
    });

    it('debe cerrar automáticamente la sesión cuando el tiempo de inactividad llega a cero', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
        await result.current.iniciarSesion('admin', 'admin123');
      });
      expect(result.current.sesionActiva).toBe(true);

      // Avanzar los 900 segundos completos de inactividad
      act(() => {
        vi.advanceTimersByTime(901 * 1000);
      });

      // La sesión debe haberse cerrado automáticamente
      expect(result.current.sesionActiva).toBe(false);
      expect(result.current.usuarioActual).toBeNull();
      expect(sessionStorage.getItem('calculadora_usuario_sesion')).toBeNull();
    });

    it('debe cerrar automáticamente la sesión cuando se alcanza el límite máximo absoluto de duración (30 min)', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
        await result.current.iniciarSesion('admin', 'admin123');
      });
      expect(result.current.sesionActiva).toBe(true);

      // Simular actividad periódica cada 100 segundos para que no muera por inactividad
      for (let i = 0; i < 18; i++) {
        act(() => {
          vi.advanceTimersByTime(100 * 1000);
          window.dispatchEvent(new MouseEvent('mousemove'));
        });
      }

      // Al alcanzar los 1800 segundos (30 minutos), el tiempo máximo se agota
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.sesionActiva).toBe(false);
      expect(result.current.usuarioActual).toBeNull();
    });
  });
});
