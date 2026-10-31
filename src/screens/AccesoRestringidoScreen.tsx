import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ShieldAlert, ArrowLeft, LogIn, Lock } from 'lucide-react';

interface AccesoRestringidoScreenProps {
  nombreSeccion?: string;
}

export const AccesoRestringidoScreen: React.FC<AccesoRestringidoScreenProps> = ({
  nombreSeccion = 'Esta sección',
}) => {
  const { setCurrentScreen } = useApp();
  const { usuarioActual, sesionActiva } = useAuth();

  const esGarzon = sesionActiva && usuarioActual?.rol === 'garzon';

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-amber-300 dark:border-amber-700/60 p-6 sm:p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
            <Lock className="w-3 h-3" /> Acceso Restringido
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Función Exclusiva para Administradores
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {nombreSeccion} requiere permisos de Administrador para ser visualizada o modificada.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 text-left space-y-2">
          {esGarzon ? (
            <p>
              Actualmente has iniciado sesión como{' '}
              <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                {usuarioActual.nombre}
              </strong>{' '}
              (Rol: <strong className="text-emerald-600 dark:text-emerald-400">Garzón</strong>).
              Los garzones solo tienen acceso al cálculo de propinas, historial y estadísticas
              personales.
            </p>
          ) : (
            <p>
              No has iniciado sesión o tu cuenta no cuenta con permisos administrativos.
            </p>
          )}
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
            Para acceder a la configuración, administración de garzones o copias de seguridad, inicia
            sesión con la cuenta de administrador.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => setCurrentScreen('home')}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>

          <button
            onClick={() => setCurrentScreen('login')}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{esGarzon ? 'Cambiar a Admin' : 'Iniciar Sesión'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
