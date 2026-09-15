import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Garzon } from '../types';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  X,
  UserCheck,
} from 'lucide-react';

export const GestionarGarzonesScreen: React.FC = () => {
  const {
    garzones,
    porcentajeTotalGarzones,
    esPorcentajeValido,
    agregarGarzon,
    actualizarGarzon,
    eliminarGarzon,
    setCurrentScreen,
    setSelectedGarzonName,
  } = useApp();
  const { usuarioActual } = useAuth();

  // Modal states
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [garzonSeleccionado, setGarzonSeleccionado] = useState<Garzon | null>(null);

  // Form states
  const [nombreInput, setNombreInput] = useState('');
  const [porcentajeInput, setPorcentajeInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setNombreInput('');
    setPorcentajeInput('');
    setFormError(null);
    setGarzonSeleccionado(null);
    setModalType('add');
  };

  const openEditModal = (g: Garzon) => {
    setNombreInput(g.nombre);
    setPorcentajeInput(g.porcentaje.toString());
    setFormError(null);
    setGarzonSeleccionado(g);
    setModalType('edit');
  };

  const openDeleteModal = (g: Garzon) => {
    setGarzonSeleccionado(g);
    setModalType('delete');
  };

  const closeModal = () => {
    setModalType(null);
    setGarzonSeleccionado(null);
    setFormError(null);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const pct = parseFloat(porcentajeInput);
    if (isNaN(pct) || pct < 0) {
      setFormError('Porcentaje inválido');
      return;
    }

    const res = agregarGarzon({
      nombre: nombreInput.trim(),
      porcentaje: pct,
    });

    if (!res.success) {
      setFormError(res.error || 'Error al agregar garzón');
    } else {
      closeModal();
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!garzonSeleccionado) return;
    setFormError(null);

    const pct = parseFloat(porcentajeInput);
    if (isNaN(pct) || pct < 0) {
      setFormError('Porcentaje inválido');
      return;
    }

    const res = actualizarGarzon(garzonSeleccionado.nombre, {
      nombre: nombreInput.trim(),
      porcentaje: pct,
    });

    if (!res.success) {
      setFormError(res.error || 'Error al actualizar garzón');
    } else {
      closeModal();
    }
  };

  const handleConfirmDelete = () => {
    if (!garzonSeleccionado) return;
    eliminarGarzon(garzonSeleccionado.nombre);
    closeModal();
  };

  const handleVerDetalle = (nombre: string) => {
    setSelectedGarzonName(nombre);
    setCurrentScreen('garzon-detail');
  };

  const puedeEditar = usuarioActual?.rol === 'admin';

  return (
    <div className="space-y-5">
      {/* Top Banner with Total Percentage */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          !esPorcentajeValido
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              !esPorcentajeValido
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300'
                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
            }`}
          >
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base">
              Porcentaje Total:{' '}
              <span
                className={
                  !esPorcentajeValido
                    ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                    : 'text-blue-600 dark:text-blue-400 font-extrabold'
                }
              >
                {porcentajeTotalGarzones.toFixed(1)}%
              </span>{' '}
              / 100%
            </h2>
            {!esPorcentajeValido ? (
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>¡Error! El porcentaje total excede el 100%</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Suma de porcentajes en rango válido</span>
              </p>
            )}
          </div>
        </div>

        {puedeEditar ? (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Garzón</span>
          </button>
        ) : (
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">
            Modo solo lectura (Garzón)
          </span>
        )}
      </div>

      {/* List of Garzones */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Garzones Registrados ({garzones.length})
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Haz clic en un garzón para ver su historial acumulado
          </span>
        </div>

        {garzones.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            No hay garzones registrados. Haga clic en "Agregar Garzón" para comenzar.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {garzones.map((garzon) => (
              <div
                key={garzon.nombre}
                className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750/40 transition-colors"
              >
                <div
                  onClick={() => handleVerDetalle(garzon.nombre)}
                  className="flex items-center gap-3 cursor-pointer group flex-1"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 transition-colors">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      <span>{garzon.nombre}</span>
                      <Eye className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 mt-0.5">
                      Porcentaje: {garzon.porcentaje.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => handleVerDetalle(garzon.nombre)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs transition-colors"
                    title="Ver estadísticas del garzón"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {puedeEditar && (
                    <>
                      <button
                        onClick={() => openEditModal(garzon)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg text-xs transition-colors"
                        title="Editar garzón"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openDeleteModal(garzon)}
                        className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg text-xs transition-colors"
                        title="Eliminar garzón"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add or Edit Waiter */}
      {(modalType === 'add' || modalType === 'edit') && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {modalType === 'add' ? 'Agregar Garzón' : 'Editar Garzón'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={modalType === 'add' ? handleSaveAdd : handleSaveEdit}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del garzón
                </label>
                <input
                  type="text"
                  value={nombreInput}
                  onChange={(e) => setNombreInput(e.target.value)}
                  placeholder="Ej. Roberto"
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Porcentaje (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={porcentajeInput}
                  onChange={(e) => setPorcentajeInput(e.target.value)}
                  placeholder="Ej. 25"
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  {modalType === 'add' ? 'Agregar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {modalType === 'delete' && garzonSeleccionado && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Eliminar Garzón
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              ¿Estás seguro de que deseas eliminar a{' '}
              <strong>{garzonSeleccionado.nombre}</strong> de la lista de garzones?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
