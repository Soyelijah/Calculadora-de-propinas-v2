import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BackupService } from '../services/backupService';
import { InfoBackup } from '../types';
import {
  Database,
  Download,
  Upload,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const BackupScreen: React.FC = () => {
  const { recargarPropinas, showNotification } = useApp();
  const backupService = BackupService.getInstance();

  const [ultimoBackup, setUltimoBackup] = useState<InfoBackup | null>(() =>
    backupService.getInfoUltimoBackup()
  );
  const [cargando, setCargando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<{
    tipo: 'success' | 'error';
    texto: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCrearBackup = async () => {
    setCargando(true);
    setMensajeEstado(null);

    const res = await backupService.crearBackup();
    setCargando(false);

    if (res.success && res.info) {
      setUltimoBackup(res.info);
      setMensajeEstado({
        tipo: 'success',
        texto: 'Backup creado y descargado exitosamente.',
      });
      showNotification('Backup creado exitosamente', 'success');
    } else {
      setMensajeEstado({
        tipo: 'error',
        texto: 'Error al crear el backup.',
      });
      showNotification('Error al crear el backup', 'error');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setCargando(true);
    setMensajeEstado(null);

    const res = await backupService.restaurarDesdeArchivo(file);
    setCargando(false);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (res.success) {
      recargarPropinas();
      setUltimoBackup(backupService.getInfoUltimoBackup());
      setMensajeEstado({
        tipo: 'success',
        texto: 'Datos restaurados exitosamente desde el archivo.',
      });
      showNotification('Datos restaurados exitosamente', 'success');
    } else {
      setMensajeEstado({
        tipo: 'error',
        texto: res.message || 'Error al restaurar los datos.',
      });
      showNotification(res.message || 'Error al restaurar los datos', 'error');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
          <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Backup y Restauración
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleCrearBackup}
            disabled={cargando}
            className="py-3 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Crear Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={cargando}
            className="py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Restaurar desde Archivo</span>
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Status Message */}
        {mensajeEstado && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              mensajeEstado.tipo === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200'
            }`}
          >
            {mensajeEstado.tipo === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{mensajeEstado.texto}</span>
          </div>
        )}

        {/* Last Backup Info Card */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 space-y-2">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Información del Último Backup</span>
          </h3>

          {ultimoBackup ? (
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Fecha:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {ultimoBackup.fecha_backup}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Versión:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {ultimoBackup.version}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Registros:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {ultimoBackup.cantidad_registros}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Tamaño:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {(ultimoBackup.tamanio_bytes / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
              Aún no se ha registrado ningún backup en este dispositivo.
            </p>
          )}
        </div>

        {/* About Backups Card matching Flutter app */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Acerca de Backups</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1">
            <li>Los backups incluyen todo el historial de propinas calculado.</li>
            <li>Se descargan en formato JSON estándar compatible.</li>
            <li>Puedes restaurar datos en cualquier momento desde un archivo previo.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
