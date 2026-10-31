import React, { useState } from 'react';
import { Propina } from '../types';
import {
  calcularResumenMes,
  generarReportePDFMesActual,
  imprimirDocumentoPDF,
  formatearMonedaCL,
} from '../services/pdfReportService';
import {
  FileText,
  Download,
  Printer,
  X,
  Calendar,
  Users,
  CreditCard,
  ChefHat,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface ReportePDFMesModalProps {
  isOpen: boolean;
  onClose: () => void;
  propinasMes: Propina[];
  adminNombre?: string;
}

export const ReportePDFMesModal: React.FC<ReportePDFMesModalProps> = ({
  isOpen,
  onClose,
  propinasMes,
  adminNombre = 'Administrador',
}) => {
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  if (!isOpen) return null;

  const resumen = calcularResumenMes(propinasMes);
  const hayRegistros = propinasMes.length > 0;

  const handleDescargarPDF = () => {
    try {
      setGenerandoPDF(true);
      generarReportePDFMesActual(propinasMes, {
        adminNombre,
        nombreRestaurante: 'Calculadora de Propinas',
        descargarDirecto: true,
      });
      setMensajeExito('El archivo PDF se ha descargado correctamente.');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const handleImprimir = () => {
    try {
      const doc = generarReportePDFMesActual(propinasMes, {
        adminNombre,
        nombreRestaurante: 'Calculadora de Propinas',
        descargarDirecto: false,
      });
      imprimirDocumentoPDF(doc);
      setMensajeExito('Se ha enviado el documento al diálogo de impresión.');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (error) {
      console.error('Error al enviar a impresión:', error);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Reporte Mensual de Propinas
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                  <Calendar className="w-3 h-3" />
                  {resumen.nombreMes} {resumen.anio}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resumen consolidado y detalle de turnos para impresión y auditoría
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleImprimir}
              disabled={!hayRegistros || generandoPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Imprimir reporte directamente"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={handleDescargarPDF}
              disabled={!hayRegistros || generandoPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Descargar archivo PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{generandoPDF ? 'Generando...' : 'Descargar PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors ml-1"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensaje de éxito temporal */}
        {mensajeExito && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* Contenido / Vista Previa */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {!hayRegistros ? (
            <div className="p-8 text-center bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                No hay propinas registradas en {resumen.nombreMes} {resumen.anio}
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 max-w-md mx-auto">
                Para generar este reporte mensual, ingrese y guarde cálculos de distribución durante el
                mes en curso.
              </p>
            </div>
          ) : (
            <>
              {/* Tarjetas Métricas Ejecutivas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                    <span>Total Recaudado</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {formatearMonedaCL(resumen.totalRecaudado)}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {resumen.cantidadRegistros} {resumen.cantidadRegistros === 1 ? 'turno' : 'turnos'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Retención Transbank</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatearMonedaCL(resumen.totalTransbank)}
                  </div>
                  <span className="text-[10px] text-slate-400">Deducido automáticamente</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    <ChefHat className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Fondo Cocina</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatearMonedaCL(resumen.totalCocina)}
                  </div>
                  <span className="text-[10px] text-slate-400">Asignado a personal cocina</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Fondo Garzones</span>
                  </div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {formatearMonedaCL(resumen.totalGarzones)}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {resumen.totalesPorGarzon.length} garzones activos
                  </span>
                </div>
              </div>

              {/* Tabla 1: Consolidado por Garzón */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    1. Consolidado Acumulado por Garzón ({resumen.nombreMes} {resumen.anio})
                  </h4>
                  <span className="text-xs text-slate-400">
                    Total fondo garzones: {formatearMonedaCL(resumen.totalGarzones)}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 font-semibold">
                      <tr>
                        <th className="px-3 py-2 w-10 text-center">#</th>
                        <th className="px-3 py-2">Garzón</th>
                        <th className="px-3 py-2 text-center">Turnos Participados</th>
                        <th className="px-3 py-2 text-right">Monto Acumulado</th>
                        <th className="px-3 py-2 text-right">% Fondo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {resumen.totalesPorGarzon.map((g, idx) => (
                        <tr
                          key={g.nombre}
                          className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition-colors"
                        >
                          <td className="px-3 py-2 text-center text-slate-400 font-medium">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-100">
                            {g.nombre}
                          </td>
                          <td className="px-3 py-2 text-center text-slate-600 dark:text-slate-300">
                            {g.turnosParticipados}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-slate-100">
                            {formatearMonedaCL(g.montoTotalRecibido)}
                          </td>
                          <td className="px-3 py-2 text-right text-indigo-600 dark:text-indigo-400 font-semibold">
                            {g.porcentajeDelFondoGarzones.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 dark:bg-slate-900 font-bold border-t border-slate-200 dark:border-slate-700">
                      <tr>
                        <td colSpan={2} className="px-3 py-2 text-slate-700 dark:text-slate-300">
                          TOTAL GENERAL GARZONES
                        </td>
                        <td className="px-3 py-2 text-center text-slate-700 dark:text-slate-300">
                          {resumen.cantidadRegistros} turnos
                        </td>
                        <td className="px-3 py-2 text-right text-slate-900 dark:text-slate-100">
                          {formatearMonedaCL(resumen.totalGarzones)}
                        </td>
                        <td className="px-3 py-2 text-right text-indigo-600 dark:text-indigo-400">
                          100.0%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Tabla 2: Detalle Cronológico de Turnos */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  2. Detalle Cronológico de Registros ({resumen.registros.length})
                </h4>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 font-semibold">
                      <tr>
                        <th className="px-3 py-2">Fecha y Hora</th>
                        <th className="px-3 py-2 text-right">Total</th>
                        <th className="px-3 py-2 text-right">Transbank</th>
                        <th className="px-3 py-2 text-right">Cocina</th>
                        <th className="px-3 py-2">Distribución a Garzones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {resumen.registros.map((p) => {
                        const fechaStr = new Date(p.fecha).toLocaleDateString('es-CL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition-colors"
                          >
                            <td className="px-3 py-2 font-medium whitespace-nowrap text-slate-900 dark:text-slate-100">
                              {fechaStr}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                              {formatearMonedaCL(p.montoTotal)}
                            </td>
                            <td className="px-3 py-2 text-right text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              {formatearMonedaCL(p.montoTransbank)}
                            </td>
                            <td className="px-3 py-2 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              {formatearMonedaCL(p.montoCocina)}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(p.montosPorGarzon).map(([nom, monto]) => (
                                  <span
                                    key={nom}
                                    className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px]"
                                  >
                                    <span className="font-semibold">{nom}:</span>{' '}
                                    {formatearMonedaCL(monto)}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sección de Firmas (Visual para el usuario que va a imprimir) */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-8 text-center text-xs text-slate-400">
                <div className="pt-6 border-t border-dashed border-slate-300 dark:border-slate-600">
                  <p className="font-medium text-slate-600 dark:text-slate-300">
                    Firma Administrador / Caja
                  </p>
                  <p className="text-[10px] mt-0.5">{adminNombre}</p>
                </div>
                <div className="pt-6 border-t border-dashed border-slate-300 dark:border-slate-600">
                  <p className="font-medium text-slate-600 dark:text-slate-300">
                    Firma Representante Garzones
                  </p>
                  <p className="text-[10px] mt-0.5">Conformidad de entrega</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {hayRegistros
              ? `${resumen.cantidadRegistros} registros en ${resumen.nombreMes} ${resumen.anio}`
              : 'Sin registros para este mes'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            {hayRegistros && (
              <button
                onClick={handleDescargarPDF}
                disabled={generandoPDF}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
