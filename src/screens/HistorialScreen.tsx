import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { TipSummary } from '../components/TipSummary';
import {
  History,
  Download,
  Search,
  Calendar,
  LayoutGrid,
  Table as TableIcon,
  X,
  Trash2,
} from 'lucide-react';

export const HistorialScreen: React.FC = () => {
  const { propinas, eliminarPropina, exportarCSV } = useApp();
  const { usuarioActual } = useAuth();

  const [searchGarzon, setSearchGarzon] = useState('');
  const [desdeFecha, setDesdeFecha] = useState('');
  const [hastaFecha, setHastaFecha] = useState('');
  const [vistaModo, setVistaModo] = useState<'cards' | 'table'>('cards');

  const filteredPropinas = useMemo(() => {
    return propinas.filter((propina) => {
      // 1. Search by waiter
      if (searchGarzon.trim()) {
        const query = searchGarzon.trim().toLowerCase();
        const tieneGarzon = Object.keys(propina.montosPorGarzon).some((name) =>
          name.toLowerCase().includes(query)
        );
        if (!tieneGarzon) return false;
      }

      // 2. Date filters
      const propinaDate = new Date(propina.fecha);
      if (desdeFecha) {
        const from = new Date(desdeFecha);
        from.setHours(0, 0, 0, 0);
        if (propinaDate < from) return false;
      }

      if (hastaFecha) {
        const to = new Date(hastaFecha);
        to.setHours(23, 59, 59, 999);
        if (propinaDate > to) return false;
      }

      return true;
    });
  }, [propinas, searchGarzon, desdeFecha, hastaFecha]);

  const limpiarFiltros = () => {
    setSearchGarzon('');
    setDesdeFecha('');
    setHastaFecha('');
  };

  const hayFiltros = searchGarzon !== '' || desdeFecha !== '' || hastaFecha !== '';
  const puedeEliminar = usuarioActual?.rol === 'admin';

  return (
    <div className="space-y-5">
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Historial de Propinas ({filteredPropinas.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-700/80 p-1 rounded-lg border border-slate-200 dark:border-slate-600">
              <button
                onClick={() => setVistaModo('cards')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                  vistaModo === 'cards'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
                title="Ver como tarjetas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
              <button
                onClick={() => setVistaModo('table')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                  vistaModo === 'table'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
                title="Ver como tabla"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={exportarCSV}
              disabled={propinas.length === 0}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchGarzon}
              onChange={(e) => setSearchGarzon(e.target.value)}
              placeholder="Buscar por nombre de garzón..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
            </span>
            <input
              type="date"
              value={desdeFecha}
              onChange={(e) => setDesdeFecha(e.target.value)}
              title="Desde"
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
              </span>
              <input
                type="date"
                value={hastaFecha}
                onChange={(e) => setHastaFecha(e.target.value)}
                title="Hasta"
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {hayFiltros && (
              <button
                onClick={limpiarFiltros}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                title="Limpiar filtros"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content view */}
      {filteredPropinas.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400 text-sm shadow-xs">
          {hayFiltros
            ? 'No se encontraron propinas con los filtros especificados.'
            : 'No hay propinas registradas.'}
        </div>
      ) : vistaModo === 'cards' ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredPropinas.map((propina, idx) => (
            <TipSummary
              key={propina.id || idx}
              propina={propina}
              canDelete={puedeEliminar}
              onDelete={() => eliminarPropina(propina.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-200">
              <tr>
                <th className="px-3.5 py-3">Fecha</th>
                <th className="px-3.5 py-3">Monto Total</th>
                <th className="px-3.5 py-3">Transbank</th>
                <th className="px-3.5 py-3">Cocina</th>
                <th className="px-3.5 py-3">Garzones</th>
                {puedeEliminar && <th className="px-3.5 py-3 text-right">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredPropinas.map((propina) => {
                const fechaStr = new Date(propina.fecha).toLocaleDateString('es-CL', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <tr
                    key={propina.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors"
                  >
                    <td className="px-3.5 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {fechaStr}
                    </td>
                    <td className="px-3.5 py-3 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      ${Math.round(propina.montoTotal).toLocaleString('es-CL')}
                    </td>
                    <td className="px-3.5 py-3 text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      ${Math.round(propina.montoTransbank).toLocaleString('es-CL')}
                    </td>
                    <td className="px-3.5 py-3 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      ${Math.round(propina.montoCocina).toLocaleString('es-CL')}
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(propina.montosPorGarzon).map(([nombre, monto]) => (
                          <span
                            key={nombre}
                            className="inline-block bg-slate-100 dark:bg-slate-700/80 px-1.5 py-0.5 rounded text-[11px]"
                          >
                            <strong>{nombre}:</strong> ${Math.round(monto).toLocaleString('es-CL')}
                          </span>
                        ))}
                      </div>
                    </td>
                    {puedeEliminar && (
                      <td className="px-3.5 py-3 text-right">
                        <button
                          onClick={() => eliminarPropina(propina.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
