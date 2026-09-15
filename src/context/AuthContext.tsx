import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Usuario } from '../types';
import { AuthService } from '../services/authService';
import { StorageService } from '../services/storageService';

interface AuthContextType {
  usuarioActual: Usuario | null;
  sesionActiva: boolean;
  tiempoMaximoRestante: number; // in seconds
  tiempoInactividadRestante: number; // in seconds
  alertaExpiracionVisible: boolean;
  motivoExpiracion: 'inactividad' | 'maximo' | null;
  iniciarSesion: (usuario: string, contrasena: string) => Promise<boolean>;
  cerrarSesion: (motivo?: string) => void;
  extenderSesion: () => void;
  actualizarUsuario: (usuario: Usuario) => void;
  errorMensaje: string | null;
  setErrorMensaje: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authService = AuthService.getInstance();
  const storageService = StorageService.getInstance();
  const config = storageService.getConfiguracion();

  const DURACION_MAXIMA_SEG = (config.minutosMaximoSesion || 30) * 60;
  const DURACION_INACTIVIDAD_SEG = (config.minutosInactividad || 15) * 60;

  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(() => {
    const savedUser = sessionStorage.getItem('calculadora_usuario_sesion');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [tiempoMaximoRestante, setTiempoMaximoRestante] = useState<number>(DURACION_MAXIMA_SEG);
  const [tiempoInactividadRestante, setTiempoInactividadRestante] = useState<number>(DURACION_INACTIVIDAD_SEG);
  const [alertaExpiracionVisible, setAlertaExpiracionVisible] = useState<boolean>(false);
  const [motivoExpiracion, setMotivoExpiracion] = useState<'inactividad' | 'maximo' | null>(null);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const maximoTimerRef = useRef<number | null>(null);
  const inactividadTimerRef = useRef<number | null>(null);
  const ultimaActividadRef = useRef<number>(Date.now());
  const inicioSesionRef = useRef<number>(Date.now());

  const cerrarSesion = useCallback((motivo?: string) => {
    if (usuarioActual) {
      storageService.registrarAuditoria(
        'logout',
        motivo ? `Sesión cerrada (${motivo}) para: ${usuarioActual.nombre}` : `Cierre de sesión para: ${usuarioActual.nombre}`,
        usuarioActual.nombre
      );
    }
    setUsuarioActual(null);
    sessionStorage.removeItem('calculadora_usuario_sesion');
    setTiempoMaximoRestante(DURACION_MAXIMA_SEG);
    setTiempoInactividadRestante(DURACION_INACTIVIDAD_SEG);
    setAlertaExpiracionVisible(false);
    setMotivoExpiracion(null);
    inicioSesionRef.current = Date.now();
    ultimaActividadRef.current = Date.now();
  }, [usuarioActual, storageService, DURACION_MAXIMA_SEG, DURACION_INACTIVIDAD_SEG]);

  const extenderSesion = useCallback(() => {
    ultimaActividadRef.current = Date.now();
    setTiempoInactividadRestante(DURACION_INACTIVIDAD_SEG);
    setAlertaExpiracionVisible(false);
    setMotivoExpiracion(null);
  }, [DURACION_INACTIVIDAD_SEG]);

  const actualizarUsuario = useCallback((usuario: Usuario) => {
    setUsuarioActual(usuario);
    sessionStorage.setItem('calculadora_usuario_sesion', JSON.stringify(usuario));
  }, []);

  const registrarActividad = useCallback(() => {
    ultimaActividadRef.current = Date.now();
    // Si no estábamos en alerta crítica, refrescar el tiempo de inactividad
    setTiempoInactividadRestante((prev) => {
      if (prev > 60) {
        return DURACION_INACTIVIDAD_SEG;
      }
      return prev;
    });
  }, [DURACION_INACTIVIDAD_SEG]);

  const iniciarSesion = async (usuario: string, contrasena: string): Promise<boolean> => {
    setErrorMensaje(null);
    try {
      const res = await authService.autenticarConDetalle(usuario, contrasena);
      if (res.usuario) {
        setUsuarioActual(res.usuario);
        sessionStorage.setItem('calculadora_usuario_sesion', JSON.stringify(res.usuario));
        setTiempoMaximoRestante(DURACION_MAXIMA_SEG);
        setTiempoInactividadRestante(DURACION_INACTIVIDAD_SEG);
        setAlertaExpiracionVisible(false);
        setMotivoExpiracion(null);
        ultimaActividadRef.current = Date.now();
        inicioSesionRef.current = Date.now();
        storageService.registrarAuditoria(
          'login',
          `Inicio de sesión exitoso para: ${res.usuario.nombre}`,
          res.usuario.nombre
        );
        return true;
      } else {
        setErrorMensaje(res.error || 'Credenciales inválidas');
        return false;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido al autenticar';
      setErrorMensaje(`Error de autenticación: ${msg}`);
      return false;
    }
  };

  // Activity listeners across the app
  useEffect(() => {
    if (!usuarioActual) return;

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    const handleUserInteraction = () => {
      registrarActividad();
    };

    events.forEach((evt) => window.addEventListener(evt, handleUserInteraction, { passive: true }));
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserInteraction));
    };
  }, [usuarioActual, registrarActividad]);

  // Dual Timers Loop
  useEffect(() => {
    if (!usuarioActual) return;

    const interval = window.setInterval(() => {
      const ahora = Date.now();
      const segundosInactivo = Math.floor((ahora - ultimaActividadRef.current) / 1000);
      const inactividadRestante = Math.max(0, DURACION_INACTIVIDAD_SEG - segundosInactivo);

      const segundosSesion = Math.floor((ahora - inicioSesionRef.current) / 1000);
      const maximoRestante = Math.max(0, DURACION_MAXIMA_SEG - segundosSesion);

      setTiempoInactividadRestante(inactividadRestante);
      setTiempoMaximoRestante(maximoRestante);

      // Check Expirations
      if (inactividadRestante <= 0) {
        cerrarSesion('Expiración por inactividad de 15 minutos');
        return;
      }

      if (maximoRestante <= 0) {
        cerrarSesion('Expiración por tiempo máximo de sesión alcanzado (30 min)');
        return;
      }

      // Show alert if either is close to expiring (<= 60 seconds)
      if (inactividadRestante <= 60) {
        setAlertaExpiracionVisible(true);
        setMotivoExpiracion('inactividad');
      } else if (maximoRestante <= 60) {
        setAlertaExpiracionVisible(true);
        setMotivoExpiracion('maximo');
      } else {
        setAlertaExpiracionVisible(false);
        setMotivoExpiracion(null);
      }
    }, 1000);

    maximoTimerRef.current = interval;

    return () => {
      if (maximoTimerRef.current) clearInterval(maximoTimerRef.current);
      if (inactividadTimerRef.current) clearInterval(inactividadTimerRef.current);
    };
  }, [usuarioActual, cerrarSesion, DURACION_INACTIVIDAD_SEG, DURACION_MAXIMA_SEG]);

  return (
    <AuthContext.Provider
      value={{
        usuarioActual,
        sesionActiva: !!usuarioActual,
        tiempoMaximoRestante,
        tiempoInactividadRestante,
        alertaExpiracionVisible,
        motivoExpiracion,
        iniciarSesion,
        cerrarSesion,
        extenderSesion,
        actualizarUsuario,
        errorMensaje,
        setErrorMensaje,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
