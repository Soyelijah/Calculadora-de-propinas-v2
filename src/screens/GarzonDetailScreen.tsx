import React from 'react';
import { useApp } from '../context/AppContext';
import { User, DollarSign, Calendar, Calculator, ArrowLeft } from 'lucide-react';

export const GarzonDetailScreen: React.FC = () => {
  const { selectedGarzonName, propinas, garzones, setCurrentScreen } = useApp();

  const garzonConfig = garzones.find((g) => g.nombre === selectedGarzonName);

  // Filter propinas for this waiter
  const propinasGarzon = propinas.filter(
    (p) => selectedGarzonName && p.montosPorGarzon[selectedGarzonName] !== undefined
  );

  const totalAcumulado = propinasGarzon.reduce(
    (sum, p) => sum + (selectedGarzonName ? p.montosPorGarzon[selectedGarzonName] || 0 : 0),
    0
  );

  const promedio = propinasGarzon.length > 0 ? totalAcumulado / propinasGarzon.length : 0;

  if (!selectedGarzonName) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500">No se ha seleccionado ningún garzón.</p>
        <button
          onClick={() => setCurrentScreen('gestionar-garzones')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs"
        >
          Volver a Garzones
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Waiter Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {selectedGarzonName}
              </h2>
              {garzonConfig && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                  Ponderación actual: {garzonConfig.porcentaje.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setCurrentScreen('gestionar-garzones')}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
            <span className="text-xs text-emerald-700 dark:text-emerald-300 block flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Total Acumulado:
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-100 mt-1 block">
              ${Math.round(totalAcumulado).toLocaleString('es-CL')}
            </span>
          </div>

          <div className="bg-blue-50/70 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-200 dark:border-blue-900/50">
            <span className="text-xs text-blue-700 dark:text-blue-300 block flex items-center gap-1">
              <Calculator className="w-3 h-3" /> Promedio:
            </span>
            <span className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-100 mt-1 block">
              ${Math.round(promedio).toLocaleString('es-CL')}
            </span>
          </div>

          <div className="bg-purple-50/70 dark:bg-purple-950/40 p-3 rounded-lg border border-purple-200 dark:border-purple-900/50">
            <span className="text-xs text-purple-700 dark:text-purple-300 block flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Turnos / Cálculos:
            </span>
            <span className="text-base sm:text-lg font-bold text-purple-900 dark:text-purple-100 mt-1 block">
              {propinasGarzon.length}
            </span>
          </div>
        </div>
      </div>

      {/* History specifically for this waiter */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
          Historial de Propinas Asignadas ({propinasGarzon.length})
        </h3>

        {propinasGarzon.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            No se han registrado propinas asignadas a este garzón.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {propinasGarzon.map((p) => {
              const monto = p.montosPorGarzon[selectedGarzonName] || 0;
              const fechaStr = new Date(p.fecha).toLocaleDateString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      {fechaStr}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      Total mesa/turno: ${Math.round(p.montoTotal).toLocaleString('es-CL')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block">
                      ${Math.round(monto).toLocaleString('es-CL')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {p.montoTotal > 0 ? ((monto / p.montoTotal) * 100).toFixed(1) : 0}% del total
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
