import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { AuthService } from '../services/authService';
import { KeyRound, Lock, User, AlertCircle, CheckCircle2, ArrowLeft, LogOut } from 'lucide-react';

export const CambiarContrasenaScreen: React.FC = () => {
  const { usuarioActual, cerrarSesion, actualizarUsuario } = useAuth();
  const { showNotification, setCurrentScreen } = useApp();

  const [usuario, setUsuario] = useState(usuarioActual?.nombre || 'admin');
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const authService = AuthService.getInstance();

  const handleVolverAlLogin = () => {
    cerrarSesion('Regreso voluntario a inicio de sesión');
    setCurrentScreen('login');
  };

  const handleVolverAlInicio = () => {
    setCurrentScreen('home');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);
    setExito(false);

    if (
      !usuario.trim() ||
      !contrasenaActual.trim() ||
      !nuevaContrasena.trim() ||
      !confirmarContrasena.trim()
    ) {
      setErrorLocal('Por favor complete todos los campos');
      return;
    }

    if (nuevaContrasena.length < 6) {
      setErrorLocal('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setErrorLocal('Las contraseñas nuevas no coinciden');
      return;
    }

    setCargando(true);
    const res = await authService.cambiarContrasena(
      usuario.trim(),
      contrasenaActual,
      nuevaContrasena
    );
    setCargando(false);

    if (res.success) {
      setExito(true);
      setContrasenaActual('');
      setNuevaContrasena('');
      setConfirmarContrasena('');
      if (usuarioActual) {
        actualizarUsuario({
          ...usuarioActual,
          debeCambiarContrasena: false,
        });
      }
      showNotification('Contraseña cambiada exitosamente', 'success');
      setTimeout(() => {
        setCurrentScreen('home');
      }, 1500);
    } else {
      setErrorLocal(
        res.message || 'Error al cambiar la contraseña. Verifique sus credenciales.'
      );
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Botón superior directo para volver al login */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleVolverAlLogin}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Login</span>
        </button>

        {!usuarioActual?.debeCambiarContrasena && (
          <button
            type="button"
            onClick={handleVolverAlInicio}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span>Ir al Inicio</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Cambiar Contraseña
            </h2>
          </div>
          <button
            type="button"
            onClick={handleVolverAlLogin}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Cerrar sesión y volver a la pantalla de ingreso"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>

        {usuarioActual?.debeCambiarContrasena && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-lg flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1">
              <p className="font-semibold">Cambio obligatorio de contraseña inicial</p>
              <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300/90">
                Por seguridad del sistema, debe actualizar sus credenciales. Si desea ingresar con otra cuenta o volver más tarde, utilice el botón <strong>Volver al Login</strong>.
              </p>
            </div>
          </div>
        )}

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
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Nombre de usuario"
                required
                className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Contraseña Actual
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Nueva Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                placeholder="Repita la nueva contraseña"
                required
                className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {errorLocal && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-lg flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorLocal}</span>
            </div>
          )}

          {exito && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-lg flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Contraseña cambiada exitosamente</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{cargando ? 'Actualizando...' : 'Cambiar Contraseña'}</span>
            </button>

            <button
              type="button"
              onClick={handleVolverAlLogin}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Volver al Login</span>
            </button>
          </div>
        </form>

        {/* Instructions matching Flutter */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3.5 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <div className="font-semibold text-slate-700 dark:text-slate-300">Instrucciones:</div>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Ingrese su nombre de usuario</li>
            <li>Ingrese su contraseña actual</li>
            <li>Ingrese la nueva contraseña (mínimo 6 caracteres)</li>
            <li>Confirme la nueva contraseña</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
