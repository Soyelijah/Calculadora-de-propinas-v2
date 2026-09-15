import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Calculator,
  Moon,
  Sun,
  Laptop,
  Settings,
  LogOut,
  LogIn,
  ArrowLeft,
  RotateCw,
} from 'lucide-react';
import { ScreenType } from '../types';

export const Header: React.FC = () => {
  const { usuarioActual, sesionActiva, cerrarSesion } = useAuth();
  const { currentScreen, setCurrentScreen, configuracion, setThemeMode, recargarGarzones } =
    useApp();

  const handleNextTheme = () => {
    if (configuracion.themeMode === 'light') setThemeMode('dark');
    else if (configuracion.themeMode === 'dark') setThemeMode('system');
    else setThemeMode('light');
  };

  const getScreenTitle = (screen: ScreenType): string => {
    switch (screen) {
      case 'home':
        return 'Calculadora de Propinas';
      case 'login':
        return 'Iniciar Sesión';
      case 'gestionar-garzones':
        return 'Gestionar Garzones';
      case 'historial':
        return 'Historial de Propinas';
      case 'estadisticas':
        return 'Estadísticas';
      case 'configuracion':
        return 'Configuración';
      case 'backup':
        return 'Backup y Restauración';
      case 'cambiar-contrasena':
        return 'Cambiar Contraseña';
      case 'garzon-detail':
        return 'Detalle de Garzón';
      default:
        return 'Calculadora de Propinas';
    }
  };

  const isSubScreen = currentScreen !== 'home' && currentScreen !== 'login';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Back button or Logo */}
        <div className="flex items-center gap-3">
          {isSubScreen ? (
            <button
              onClick={() => {
                if (currentScreen === 'cambiar-contrasena') {
                  if (usuarioActual?.debeCambiarContrasena) {
                    cerrarSesion('Regreso a login desde cambio forzado');
                    setCurrentScreen('login');
                  } else {
                    setCurrentScreen('home');
                  }
                } else {
                  setCurrentScreen('home');
                }
              }}
              className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-sm font-medium"
              title={
                currentScreen === 'cambiar-contrasena' && usuarioActual?.debeCambiarContrasena
                  ? 'Volver al inicio de sesión'
                  : 'Volver al inicio'
              }
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">
                {currentScreen === 'cambiar-contrasena' && usuarioActual?.debeCambiarContrasena
                  ? 'Volver al Login'
                  : 'Volver'}
              </span>
            </button>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
          )}

          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-tight">
              {getScreenTitle(currentScreen)}
            </h1>
            {isSubScreen && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Calculadora de Propinas
              </p>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Refresh action if on home */}
          {currentScreen === 'home' && (
            <button
              onClick={recargarGarzones}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Recargar garzones"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          )}

          {/* Theme switcher */}
          <button
            onClick={handleNextTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Tema actual: ${configuracion.themeMode}. Clic para alternar.`}
          >
            {configuracion.themeMode === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : configuracion.themeMode === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Laptop className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Settings shortcut */}
          {currentScreen !== 'configuracion' && currentScreen !== 'login' && (
            <button
              onClick={() => setCurrentScreen('configuracion')}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Configuración"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* User profile / Login / Logout */}
          {sesionActiva && usuarioActual ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className="hidden sm:flex flex-col items-end text-right px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px]"
                title="Sesión activa"
              >
                <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                  <span>{usuarioActual.nombre}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                      usuarioActual.rol === 'admin'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                    }`}
                  >
                    {usuarioActual.rol === 'admin' ? 'Admin' : 'Garzón'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  cerrarSesion('Voluntario por usuario');
                  setCurrentScreen('login');
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
                title={`Cerrar sesión de ${usuarioActual.nombre}`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : currentScreen !== 'login' ? (
            <button
              onClick={() => setCurrentScreen('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
