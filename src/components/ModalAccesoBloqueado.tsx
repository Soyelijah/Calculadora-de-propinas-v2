import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Lock, LogIn, ArrowLeft, UserX } from 'lucide-react';

export const ModalAccesoBloqueado: React.FC = () => {
  const { modalBloqueo, cerrarModalBloqueo, setCurrentScreen } = useApp();
  const { usuarioActual, sesionActiva } = useAuth();

  if (!modalBloqueo || !modalBloqueo.isOpen) {
    return null;
  }

  const handleIrALogin = () => {
    cerrarModalBloqueo();
    setCurrentScreen('login');
  };

  const handleCerrar = () => {
    cerrarModalBloqueo();
  };

  const esGarzon = sesionActiva && usuarioActual?.rol === 'garzon';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl border border-amber-300 dark:border-amber-700/60 p-6 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-bloqueo-titulo"
      >
        {/* Header Icon + Badge */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 shadow-xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 mb-1">
              <Lock className="w-3 h-3" /> Privilegios Insuficientes
            </span>
            <h3
              id="modal-bloqueo-titulo"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight"
            >
              Opción Exclusiva para Administradores
            </h3>
          </div>
        </div>

        {/* Message Body */}
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <p>
            Has intentado ingresar a{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-semibold">
              "{modalBloqueo.nombreOpcion}"
            </strong>
            .
          </p>

          {esGarzon ? (
            <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
              <UserX className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                Actualmente tienes una sesión activa como{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {usuarioActual?.nombre}
                </strong>{' '}
                (Rol: <strong className="text-emerald-600 dark:text-emerald-400">Garzón</strong>).
                Esta sección contiene parámetros financieros y gestión sensible que solo pueden ser
                modificados por un Administrador.
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No has iniciado sesión o no cuentas con credenciales de nivel Administrador.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-1">
          <button
            onClick={handleCerrar}
            className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Entendido / Volver</span>
          </button>

          <button
            onClick={handleIrALogin}
            className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{esGarzon ? 'Cambiar a Admin' : 'Iniciar Sesión'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
