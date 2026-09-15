import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ModoDistribucion } from '../types';
import {
  Settings,
  Percent,
  Palette,
  RotateCcw,
  Save,
  Database,
  KeyRound,
  Sun,
  Moon,
  Laptop,
  Clock,
  SlidersHorizontal,
} from 'lucide-react';

export const ConfiguracionScreen: React.FC = () => {
  const {
    configuracion,
    guardarConfiguracion,
    restaurarValoresPredeterminados,
    setThemeMode,
    setCurrentScreen,
  } = useApp();
  const { usuarioActual } = useAuth();

  const [transbankPct, setTransbankPct] = useState<number>(configuracion.porcentajeTransbank);
  const [cocinaPct, setCocinaPct] = useState<number>(configuracion.porcentajeCocina);
  const [modoDistribucion, setModoDistribucion] = useState<ModoDistribucion>(
    configuracion.modoDistribucionPredeterminado || 'proporcional_remanente'
  );
  const [minInactividad, setMinInactividad] = useState<number>(
    configuracion.minutosInactividad || 15
  );
  const [minMaximo, setMinMaximo] = useState<number>(
    configuracion.minutosMaximoSesion || 30
  );

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    guardarConfiguracion({
      porcentajeTransbank: transbankPct,
      porcentajeCocina: cocinaPct,
      modoDistribucionPredeterminado: modoDistribucion,
      minutosInactividad: minInactividad,
      minutosMaximoSesion: minMaximo,
    });
  };

  const handleRestaurar = () => {
    restaurarValoresPredeterminados();
    setTransbankPct(3.5);
    setCocinaPct(10.0);
    setModoDistribucion('proporcional_remanente');
    setMinInactividad(15);
    setMinMaximo(30);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
          <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Configuración del Sistema
          </h2>
        </div>

        <form onSubmit={handleGuardar} className="space-y-6">
          {/* Section 1: Porcentajes */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              <Percent className="w-3.5 h-3.5 text-blue-600" />
              <span>Configuración de Deducciones Base</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Porcentaje Transbank:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {transbankPct.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.1"
                    value={transbankPct}
                    onChange={(e) => setTransbankPct(parseFloat(e.target.value))}
                    className="flex-1 accent-blue-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={transbankPct}
                    onChange={(e) => setTransbankPct(parseFloat(e.target.value) || 0)}
                    className="w-18 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-xs font-semibold text-right"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Porcentaje Cocina:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {cocinaPct.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.1"
                    value={cocinaPct}
                    onChange={(e) => setCocinaPct(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={cocinaPct}
                    onChange={(e) => setCocinaPct(parseFloat(e.target.value) || 0)}
                    className="w-18 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-xs font-semibold text-right"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Modo de Distribución */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              <span>Semántica de Distribución de Garzones</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Define la lógica matemática con la que se distribuye el fondo disponible entre los garzones.
            </p>

            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  modoDistribucion === 'proporcional_remanente'
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="modoDistribucion"
                  value="proporcional_remanente"
                  checked={modoDistribucion === 'proporcional_remanente'}
                  onChange={() => setModoDistribucion('proporcional_remanente')}
                  className="mt-0.5 accent-blue-600"
                />
                <div className="text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Proporcional Ponderada al Remanente (Recomendada)
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    El 100% del fondo post-cocina se reparte entre los garzones en proporción a sus puntos. No deja fondos sin asignar.
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  modoDistribucion === 'porcentaje_directo'
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="modoDistribucion"
                  value="porcentaje_directo"
                  checked={modoDistribucion === 'porcentaje_directo'}
                  onChange={() => setModoDistribucion('porcentaje_directo')}
                  className="mt-0.5 accent-blue-600"
                />
                <div className="text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Porcentaje Directo del Subtotal
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Cada garzón recibe exactamente el % indicado sobre el subtotal. Si la suma no alcanza el remanente, el sobrante se contabiliza explícitamente.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Seguridad de Sesión */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Seguridad y Tiempos de Expiración de Sesión</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Inactividad Máxima (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={minInactividad}
                  onChange={(e) => setMinInactividad(parseInt(e.target.value) || 15)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Cierra la sesión tras este tiempo sin interacción
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Duración Absoluta de Sesión (minutos)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={minMaximo}
                  onChange={(e) => setMinMaximo(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Límite máximo continuo de sesión activa
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Apariencia */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              <span>Apariencia y Tema</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                  configuracion.themeMode === 'light'
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 text-amber-800 dark:text-amber-300 ring-2 ring-amber-400/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Claro</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                  configuracion.themeMode === 'dark'
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 text-blue-800 dark:text-blue-300 ring-2 ring-blue-400/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Oscuro</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('system')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                  configuracion.themeMode === 'system'
                    ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 text-purple-800 dark:text-purple-300 ring-2 ring-purple-400/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Laptop className="w-4 h-4 text-slate-500" />
                <span>Sistema</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>

            <button
              type="button"
              onClick={handleRestaurar}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Predeterminados</span>
            </button>
          </div>
        </form>

        {/* Links to Backup & Password management */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
          <button
            onClick={() => setCurrentScreen('backup')}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-slate-200 dark:border-slate-700 transition-colors text-xs font-medium"
          >
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Database className="w-4 h-4 text-purple-600" />
              <span>Gestión de Backup y Restauración</span>
            </div>
            <span className="text-slate-400">→</span>
          </button>

          {usuarioActual?.rol === 'admin' && (
            <button
              onClick={() => setCurrentScreen('cambiar-contrasena')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-slate-700 transition-colors text-xs font-medium"
            >
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>Cambiar Contraseña</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

