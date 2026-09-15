import React from 'react';
import { useApp } from '../context/AppContext';
import { EstadisticasChart } from '../components/EstadisticasChart';
import {
  BarChart3,
  DollarSign,
  CreditCard,
  ChefHat,
  Users,
  Calculator,
  TrendingUp,
} from 'lucide-react';

export const EstadisticasScreen: React.FC = () => {
  const { propinas, garzones, setCurrentScreen, setSelectedGarzonName } = useApp();

  let totalPropinas = 0;
  let totalTransbank = 0;
  let totalCocina = 0;
  let totalGarzonesMonto = 0;
  const totalesPorGarzon: Record<string, { total: number; conteo: number }> = {};

  // Initialize waiter entries
  garzones.forEach((g) => {
    totalesPorGarzon[g.nombre] = { total: 0, conteo: 0 };
  });

  for (const p of propinas) {
    totalPropinas += p.montoTotal;
    totalTransbank += p.montoTransbank;
    totalCocina += p.montoCocina;

    for (const [nombre, monto] of Object.entries(p.montosPorGarzon)) {
      if (!totalesPorGarzon[nombre]) {
        totalesPorGarzon[nombre] = { total: 0, conteo: 0 };
      }
      totalesPorGarzon[nombre].total += monto;
      totalesPorGarzon[nombre].conteo += 1;
      totalGarzonesMonto += monto;
    }
  }

  const cantidadCalculos = propinas.length;

  const handleGarzonClick = (nombre: string) => {
    setSelectedGarzonName(nombre);
    setCurrentScreen('garzon-detail');
  };

  if (propinas.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400 text-sm shadow-xs space-y-2">
        <BarChart3 className="w-8 h-8 mx-auto text-slate-400" />
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          No hay datos suficientes para mostrar estadísticas
        </p>
        <p className="text-xs">
          Realice al menos un cálculo de propinas para ver gráficos y resúmenes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Chart */}
      <EstadisticasChart propinas={propinas} />

      {/* General Summary Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            Resumen General
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Total Propinas:
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 block">
              ${Math.round(totalPropinas).toLocaleString('es-CL')}
            </span>
          </div>

          <div className="bg-blue-50/70 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-200 dark:border-blue-900/50">
            <span className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" /> Total Transbank:
            </span>
            <span className="text-lg font-bold text-blue-900 dark:text-blue-100 mt-1 block">
              ${Math.round(totalTransbank).toLocaleString('es-CL')}
            </span>
          </div>

          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
            <span className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <ChefHat className="w-3.5 h-3.5" /> Total Cocina:
            </span>
            <span className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mt-1 block">
              ${Math.round(totalCocina).toLocaleString('es-CL')}
            </span>
          </div>

          <div className="bg-purple-50/70 dark:bg-purple-950/40 p-3 rounded-lg border border-purple-200 dark:border-purple-900/50">
            <span className="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Total Garzones:
            </span>
            <span className="text-lg font-bold text-purple-900 dark:text-purple-100 mt-1 block">
              ${Math.round(totalGarzonesMonto).toLocaleString('es-CL')}
            </span>
          </div>

          <div className="bg-amber-50/70 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 sm:col-span-2">
            <span className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" /> Número de Cálculos:
            </span>
            <span className="text-lg font-bold text-amber-900 dark:text-amber-100 mt-1 block">
              {cantidadCalculos}
            </span>
          </div>
        </div>
      </div>

      {/* Waiters Statistics Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Estadísticas por Garzón
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Haz clic para ver detalle
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(totalesPorGarzon).map(([nombre, data]) => {
            const porcentajeDelTotal =
              totalGarzonesMonto > 0 ? (data.total / totalGarzonesMonto) * 100 : 0;
            const promedioPorCalculo = data.conteo > 0 ? data.total / data.conteo : 0;

            return (
              <div
                key={nombre}
                onClick={() => handleGarzonClick(nombre)}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 transition-colors">
                    {nombre}
                  </h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    {porcentajeDelTotal.toFixed(1)}% del pozo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Total Recibido:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ${Math.round(data.total).toLocaleString('es-CL')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">
                      Promedio ({data.conteo} serv.):
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                      ${Math.round(promedioPorCalculo).toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
