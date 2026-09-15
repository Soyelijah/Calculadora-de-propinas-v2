import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Propina } from '../types';

interface EstadisticasChartProps {
  propinas: Propina[];
}

// Consistent colors for garzones
const GARZON_COLORS = [
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
];

function getColorForGarzon(name: string, index: number): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % GARZON_COLORS.length;
  return GARZON_COLORS[(colorIndex + index) % GARZON_COLORS.length];
}

export const EstadisticasChart: React.FC<EstadisticasChartProps> = ({ propinas }) => {
  if (propinas.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
        No hay datos suficientes para mostrar estadísticas
      </div>
    );
  }

  let totalTransbank = 0;
  let totalCocina = 0;
  const totalesGarzones: Record<string, number> = {};

  for (const propina of propinas) {
    totalTransbank += propina.montoTransbank;
    totalCocina += propina.montoCocina;

    for (const [nombre, monto] of Object.entries(propina.montosPorGarzon)) {
      totalesGarzones[nombre] = (totalesGarzones[nombre] ?? 0) + monto;
    }
  }

  const chartData: { name: string; value: number; color: string }[] = [];

  if (totalTransbank > 0) {
    chartData.push({
      name: 'Transbank',
      value: Math.round(totalTransbank),
      color: '#3b82f6', // blue
    });
  }

  if (totalCocina > 0) {
    chartData.push({
      name: 'Cocina',
      value: Math.round(totalCocina),
      color: '#10b981', // green
    });
  }

  Object.entries(totalesGarzones).forEach(([nombre, monto], idx) => {
    if (monto > 0) {
      chartData.push({
        name: nombre,
        value: Math.round(monto),
        color: getColorForGarzon(nombre, idx),
      });
    }
  });

  const totalGeneral = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
        Distribución Total de Propinas
      </h3>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                `$${value.toLocaleString('es-CL')} (${((value / totalGeneral) * 100).toFixed(1)}%)`,
                'Monto',
              ]}
              contentStyle={{
                backgroundColor: '#1e293b',
                color: '#fff',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
              }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-2.5 justify-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-1.5 text-xs bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700"
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
            <span className="text-slate-500 dark:text-slate-400 font-semibold">
              ${item.value.toLocaleString('es-CL')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
