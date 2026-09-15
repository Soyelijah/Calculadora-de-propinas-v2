import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { InfoSesionWidget } from '../components/InfoSesionWidget';
import { CalculadoraPropinaService } from '../services/calculadoraService';
import { Propina, ModoDistribucion, DetalleDistribucion } from '../types';
import {
  Calculator,
  History,
  BarChart3,
  Users,
  Settings,
  Database,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  User,
  Info,
  Lock,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    configuracion,
    garzones,
    guardarPropina,
    setCurrentScreen,
    showNotification,
  } = useApp();
  const { usuarioActual, sesionActiva } = useAuth();

  const [montoTotalInput, setMontoTotalInput] = useState<string>('');
  const [transbankInput, setTransbankInput] = useState<string>(
    configuracion.porcentajeTransbank.toString()
  );
  const [cocinaInput, setCocinaInput] = useState<string>(
    configuracion.porcentajeCocina.toString()
  );
  const [modoDistribucion, setModoDistribucion] = useState<ModoDistribucion>(
    configuracion.modoDistribucionPredeterminado || 'proporcional_remanente'
  );

  // Dynamic percentages for each waiter in the current calculation form
  const [porcentajesGarzones, setPorcentajesGarzones] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<Propina | null>(null);
  const [detalleCompleto, setDetalleCompleto] = useState<DetalleDistribucion | null>(null);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Sync default percentages when garzones change
  useEffect(() => {
    const initial: Record<string, string> = {};
    garzones.forEach((g) => {
      initial[g.nombre] = g.porcentaje.toString();
    });
    setPorcentajesGarzones(initial);
  }, [garzones]);

  // Sync default config when changed
  useEffect(() => {
    setTransbankInput(configuracion.porcentajeTransbank.toString());
    setCocinaInput(configuracion.porcentajeCocina.toString());
    if (configuracion.modoDistribucionPredeterminado) {
      setModoDistribucion(configuracion.modoDistribucionPredeterminado);
    }
  }, [configuracion]);

  const handleGarzonPorcentajeChange = (nombre: string, val: string) => {
    setPorcentajesGarzones((prev) => ({
      ...prev,
      [nombre]: val,
    }));
  };

  const handleCalcular = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    const montoTotal = parseFloat(montoTotalInput);
    if (isNaN(montoTotal) || montoTotal <= 0) {
      setErrorLocal('Por favor ingrese un monto total válido mayor a 0');
      return;
    }

    const pctTransbank = parseFloat(transbankInput);
    if (isNaN(pctTransbank) || pctTransbank < 0) {
      setErrorLocal('Por favor ingrese un porcentaje de Transbank válido');
      return;
    }

    const pctCocina = parseFloat(cocinaInput);
    if (isNaN(pctCocina) || pctCocina < 0) {
      setErrorLocal('Por favor ingrese un porcentaje de Cocina válido');
      return;
    }

    const garzonesMap: Record<string, number> = {};
    for (const g of garzones) {
      const val = parseFloat(porcentajesGarzones[g.nombre] || '0');
      if (isNaN(val) || val < 0) {
        setErrorLocal(`Porcentaje inválido para el garzón ${g.nombre}`);
        return;
      }
      garzonesMap[g.nombre] = val;
    }

    if (Object.keys(garzonesMap).length === 0) {
      setErrorLocal('Debe registrar al menos un garzón para calcular');
      return;
    }

    try {
      const calcService = new CalculadoraPropinaService();
      const nuevaPropina = calcService.calcular({
        montoTotal,
        porcentajeTransbank: pctTransbank,
        porcentajeCocina: pctCocina,
        porcentajesGarzones: garzonesMap,
        modoDistribucion,
      });

      const detalle = calcService.obtenerDetalleCompleto({
        montoTotal,
        porcentajeTransbank: pctTransbank,
        porcentajeCocina: pctCocina,
        porcentajesGarzones: garzonesMap,
        modoDistribucion,
      });

      // Save to database/storage
      guardarPropina(nuevaPropina);
      setResultado(nuevaPropina);
      setDetalleCompleto(detalle);
      showNotification('Propina calculada y guardada correctamente', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al calcular la propina';
      setErrorLocal(msg);
      showNotification(`Error: ${msg}`, 'error');
    }
  };

  const sumaPorcentajesGarzones = Object.values(porcentajesGarzones).reduce(
    (acc, v) => acc + (parseFloat(v) || 0),
    0
  );
  const sumaTotalGlobal =
    (parseFloat(transbankInput) || 0) +
    (parseFloat(cocinaInput) || 0) +
    sumaPorcentajesGarzones;

  const esAdmin = sesionActiva && usuarioActual?.rol === 'admin';

  return (
    <div className="space-y-6">
      {/* Session indicator widget */}
      <InfoSesionWidget />

      {/* Main Calculation Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Cálculo de Propinas
            </h2>
          </div>

          {/* Mode Selector Pill */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setModoDistribucion('proporcional_remanente')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                modoDistribucion === 'proporcional_remanente'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Reparto proporcional al 100% del fondo post-cocina"
            >
              Proporcional Remanente
            </button>
            <button
              type="button"
              onClick={() => setModoDistribucion('porcentaje_directo')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                modoDistribucion === 'porcentaje_directo'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Porcentaje directo sobre subtotal"
            >
              Porcentaje Directo
            </button>
          </div>
        </div>

        <form onSubmit={handleCalcular} className="space-y-5">
          {/* Monto total input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Monto Total Recaudado ($ CLP)
            </label>
            <div className="relative rounded-lg shadow-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-semibold text-sm">
                $
              </span>
              <input
                type="number"
                step="any"
                min="0"
                value={montoTotalInput}
                onChange={(e) => setMontoTotalInput(e.target.value)}
                placeholder="Ej. 100000"
                required
                className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium"
              />
            </div>
          </div>

          {/* Porcentajes base: Transbank & Cocina */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Porcentaje Transbank (%)
              </label>
              <div className="relative rounded-lg shadow-xs">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={transbankInput}
                  onChange={(e) => setTransbankInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-xs font-semibold">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Porcentaje Cocina (%)
              </label>
              <div className="relative rounded-lg shadow-xs">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={cocinaInput}
                  onChange={(e) => setCocinaInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-xs font-semibold">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Waiters distribution section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {modoDistribucion === 'proporcional_remanente'
                  ? 'Ponderación de Garzones (Puntos / Proporción)'
                  : 'Porcentaje por Garzón (% Directo)'}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  modoDistribucion === 'porcentaje_directo' && sumaTotalGlobal > 100
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {modoDistribucion === 'proporcional_remanente'
                  ? `Suma de ponderaciones: ${sumaPorcentajesGarzones.toFixed(1)} pts`
                  : `Suma total: ${sumaTotalGlobal.toFixed(1)}% / 100%`}
              </span>
            </div>

            {garzones.length === 0 ? (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
                <span>No hay garzones configurados. Agregue garzones para calcular.</span>
                <button
                  type="button"
                  onClick={() => setCurrentScreen('gestionar-garzones')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-medium"
                >
                  Ir a Garzones
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {garzones.map((garzon) => (
                  <div
                    key={garzon.nombre}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {garzon.nombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 w-24">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={porcentajesGarzones[garzon.nombre] ?? garzon.porcentaje}
                        onChange={(e) =>
                          handleGarzonPorcentajeChange(garzon.nombre, e.target.value)
                        }
                        className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-right text-xs font-semibold focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-400 font-bold">
                        {modoDistribucion === 'proporcional_remanente' ? 'pts' : '%'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorLocal && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-lg flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorLocal}</span>
            </div>
          )}

          {/* Calculate Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Calcular Distribución</span>
          </button>
        </form>
      </div>

      {/* Result & Transparent Breakdown Section */}
      {resultado && detalleCompleto && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-900/60 p-5 shadow-sm space-y-5 animate-in fade-in-50">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Desglose Transparente de la Distribución
              </h3>
            </div>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full font-medium">
              Modo: {modoDistribucion === 'proporcional_remanente' ? 'Proporcional' : 'Porcentaje Directo'}
            </span>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Monto Recaudado
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                ${Math.round(resultado.montoTotal).toLocaleString('es-CL')}
              </span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-900/50">
              <span className="text-[11px] text-blue-700 dark:text-blue-300 block font-medium">
                Transbank ({resultado.porcentajeTransbank}%)
              </span>
              <span className="text-base font-bold text-blue-900 dark:text-blue-100">
                ${Math.round(resultado.montoTransbank).toLocaleString('es-CL')}
              </span>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
              <span className="text-[11px] text-amber-700 dark:text-amber-300 block font-medium">
                Cocina ({resultado.porcentajeCocina}%)
              </span>
              <span className="text-base font-bold text-amber-900 dark:text-amber-100">
                ${Math.round(resultado.montoCocina).toLocaleString('es-CL')}
              </span>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block font-medium">
                Fondo Garzones
              </span>
              <span className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                ${Math.round(detalleCompleto.fondoGarzonesDisponible).toLocaleString('es-CL')}
              </span>
            </div>
          </div>

          {/* Waiters detailed table */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
              Detalle Individual por Garzón:
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Garzón</th>
                    <th className="px-3 py-2 font-semibold text-center">Puntos / % Formulario</th>
                    <th className="px-3 py-2 font-semibold text-center">% Efectivo Cuenta</th>
                    <th className="px-3 py-2 font-semibold text-right">Monto CLP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {detalleCompleto.garzones.map((g) => (
                    <tr key={g.nombre} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{g.nombre}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300">
                        {g.porcentajeConfigurado.toFixed(1)}
                        {modoDistribucion === 'proporcional_remanente' ? ' pts' : '%'}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-500 dark:text-slate-400 font-mono">
                        {g.porcentajeEfectivoDelTotal.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        ${Math.round(g.montoAsignado).toLocaleString('es-CL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Unassigned remainder alert if applicable */}
            {detalleCompleto.remanenteNoAsignado > 0 && (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Remanente no asignado en este modo: la suma de porcentajes de garzones no cubrió el 100% del fondo disponible.
                  </span>
                </div>
                <span className="font-bold font-mono text-sm shrink-0 ml-2">
                  ${Math.round(detalleCompleto.remanenteNoAsignado).toLocaleString('es-CL')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Navigation Action Grid (matching Flutter HomeScreen buttons) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => setCurrentScreen('historial')}
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors text-xs font-medium gap-1.5"
          >
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Ver Historial</span>
          </button>

          <button
            onClick={() => setCurrentScreen('estadisticas')}
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors text-xs font-medium gap-1.5"
          >
            <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Ver Estadísticas</span>
          </button>

          <button
            onClick={() => setCurrentScreen('gestionar-garzones')}
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors text-xs font-medium gap-1.5 relative"
          >
            {!esAdmin && (
              <span title="Requiere rol de Administrador" className="absolute top-2 right-2">
                <Lock className="w-3 h-3 text-slate-400" />
              </span>
            )}
            <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Gestionar Garzones</span>
          </button>

          <button
            onClick={() => setCurrentScreen('configuracion')}
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors text-xs font-medium gap-1.5 relative"
          >
            {!esAdmin && (
              <span title="Requiere rol de Administrador" className="absolute top-2 right-2">
                <Lock className="w-3 h-3 text-slate-400" />
              </span>
            )}
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span>Configuración</span>
          </button>

          <button
            onClick={() => setCurrentScreen('backup')}
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors text-xs font-medium gap-1.5 relative"
          >
            {!esAdmin && (
              <span title="Requiere rol de Administrador" className="absolute top-2 right-2">
                <Lock className="w-3 h-3 text-slate-400" />
              </span>
            )}
            <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Gestión de Backup</span>
          </button>

          {sesionActiva ? (
            <button
              onClick={() => setCurrentScreen('cambiar-contrasena')}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors text-xs font-medium gap-1.5"
            >
              <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Cambiar Contraseña</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentScreen('login')}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors text-xs font-medium gap-1.5"
            >
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

