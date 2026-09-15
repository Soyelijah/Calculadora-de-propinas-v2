import React from 'react';
import { User } from 'lucide-react';

interface GarzonCardProps {
  nombre: string;
  porcentaje: number;
  monto?: number;
  onClick?: () => void;
}

export const GarzonCard: React.FC<GarzonCardProps> = ({
  nombre,
  porcentaje,
  monto,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-3 my-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs transition-colors ${
        onClick ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-600' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{nombre}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Porcentaje: {porcentaje.toFixed(1)}%
          </p>
        </div>
      </div>
      {monto !== undefined && (
        <div className="text-right">
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            ${Math.round(monto).toLocaleString('es-CL')}
          </span>
        </div>
      )}
    </div>
  );
};
