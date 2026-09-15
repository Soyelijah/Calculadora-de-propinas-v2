import React from 'react';
import { Propina } from '../types';
import { Calendar, DollarSign, CreditCard, ChefHat, Users } from 'lucide-react';

interface TipSummaryProps {
  propina: Propina;
  onDelete?: () => void;
  canDelete?: boolean;
}

export const TipSummary: React.FC<TipSummaryProps> = ({
  propina,
  onDelete,
  canDelete = false,
}) => {
  const fechaObj = new Date(propina.fecha);
  const fechaFormateada = fechaObj.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 transition-all hover:shadow-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            Resumen de Propina
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {fechaFormateada}
          </span>
          {canDelete && onDelete && (
            <button
              onClick={onDelete}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded-md transition-colors"
              title="Eliminar registro"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-3 text-xs sm:text-sm">
        <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg">
          <span className="text-slate-500 dark:text-slate-400 block text-xs">Monto Total:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
            ${Math.round(propina.montoTotal).toLocaleString('es-CL')}
          </span>
        </div>
        <div className="bg-blue-50/60 dark:bg-blue-950/30 p-2.5 rounded-lg flex flex-col justify-between">
          <span className="text-blue-700 dark:text-blue-300 block text-xs flex items-center gap-1">
            <CreditCard className="w-3 h-3" /> Transbank:
          </span>
          <span className="font-semibold text-blue-900 dark:text-blue-100">
            ${Math.round(propina.montoTransbank).toLocaleString('es-CL')}
          </span>
        </div>
        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-lg flex flex-col justify-between">
          <span className="text-emerald-700 dark:text-emerald-300 block text-xs flex items-center gap-1">
            <ChefHat className="w-3 h-3" /> Cocina:
          </span>
          <span className="font-semibold text-emerald-900 dark:text-emerald-100">
            ${Math.round(propina.montoCocina).toLocaleString('es-CL')}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <Users className="w-3.5 h-3.5" />
          <span>Distribución por Garzón:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(propina.montosPorGarzon).map(([nombre, monto]) => (
            <div
              key={nombre}
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-md text-xs"
            >
              <span className="font-medium text-slate-700 dark:text-slate-200">{nombre}:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ${Math.round(monto).toLocaleString('es-CL')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
