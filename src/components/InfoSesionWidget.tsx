import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Clock, UserCheck } from 'lucide-react';

export const InfoSesionWidget: React.FC = () => {
  const { usuarioActual, sesionActiva, tiempoInactividadRestante, tiempoMaximoRestante } = useAuth();

  const tiempoRestante = Math.min(tiempoInactividadRestante, tiempoMaximoRestante);

  const formatTiempo = (segundos: number) => {
    if (segundos <= 0) return 'Sesión expirada';
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} min`;
  };

  if (!sesionActiva || !usuarioActual) {
    return (
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-slate-500 dark:text-slate-400 text-sm italic border border-slate-200 dark:border-slate-700 flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-400" />
        <span>No hay sesión activa</span>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-950/40 rounded-lg p-3.5 border border-blue-200 dark:border-blue-900/60 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {usuarioActual.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                Sesión activa: {usuarioActual.nombre}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/70 text-blue-700 dark:text-blue-300">
                <Shield className="w-3 h-3" />
                {usuarioActual.rol === 'admin' ? 'Administrador' : 'Garzón'}
              </span>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300/80 flex items-center gap-1 mt-0.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Rol: {usuarioActual.rol}</span>
            </div>
          </div>
        </div>

        <div className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900/40 flex items-center gap-1 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5" />
          <span>Tiempo restante: {formatTiempo(tiempoRestante)}</span>
        </div>
      </div>
    </div>
  );
};
