import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storageService';
import { Lock, User, LogIn, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { iniciarSesion, usuarioActual, sesionActiva, cerrarSesion, errorMensaje } = useAuth();
  const { setCurrentScreen, showNotification } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username.trim() || !password.trim()) {
      setLocalError('Por favor ingrese usuario y contraseña');
      return;
    }

    setCargando(true);
    const success = await iniciarSesion(username.trim(), password.trim());
    setCargando(false);

    if (success) {
      showNotification('Sesión iniciada correctamente', 'success');
      // Si el usuario tiene la bandera de cambio forzado de contraseña (ej. recién restablecido)
      const creds = StorageService.getInstance().getUsuariosCredenciales()[username.trim().toLowerCase()];
      if (creds?.debeCambiarContrasena) {
        showNotification('Por seguridad, debe actualizar su contraseña ahora', 'info');
        setCurrentScreen('cambiar-contrasena');
      } else {
        setCurrentScreen('home');
      }
    }
  };

  const handleSelectTestUser = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setLocalError(null);
  };

  if (sesionActiva && usuarioActual) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs max-w-md mx-auto text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Sesión Activa
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Has iniciado sesión como{' '}
          <strong className="text-blue-600 dark:text-blue-400">{usuarioActual.nombre}</strong> (
          {usuarioActual.rol === 'admin' ? 'Administrador' : 'Garzón'}).
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setCurrentScreen('home')}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Ir a la Calculadora
          </button>
          <button
            onClick={() => cerrarSesion()}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-7 shadow-xs">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-100 dark:border-blue-900/60">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ingrese sus credenciales para acceder a funciones administrativas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Usuario
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nombre de usuario (ej. admin, ana, luis)"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {(localError || errorMensaje) && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-lg flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || errorMensaje}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
          </button>
        </form>

        {/* Test Users helper card matching Flutter login_screen.dart */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Usuarios de prueba (haz clic para autocompletar):</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleSelectTestUser('admin', 'admin123')}
              className="w-full text-left p-2 rounded-md bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-between"
            >
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                admin / admin123
              </span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                (Administrador)
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTestUser('ana', 'ana123')}
              className="w-full text-left p-2 rounded-md bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-between"
            >
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                ana / ana123
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                (Garzón)
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTestUser('luis', 'luis123')}
              className="w-full text-left p-2 rounded-md bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-between"
            >
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                luis / luis123
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                (Garzón)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
