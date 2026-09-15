import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Configuracion, Garzon, Propina, ScreenType, ThemeMode } from '../types';
import { StorageService } from '../services/storageService';

interface AppContextType {
  // Navigation
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  selectedGarzonName: string | null;
  setSelectedGarzonName: (name: string | null) => void;

  // Configuration
  configuracion: Configuracion;
  guardarConfiguracion: (config: Partial<Configuracion>) => void;
  restaurarValoresPredeterminados: () => void;
  setThemeMode: (mode: ThemeMode) => void;

  // Garzones
  garzones: Garzon[];
  porcentajeTotalGarzones: number;
  esPorcentajeValido: boolean;
  agregarGarzon: (garzon: Garzon) => { success: boolean; error?: string };
  actualizarGarzon: (nombreAntiguo: string, garzon: Garzon) => { success: boolean; error?: string };
  eliminarGarzon: (nombre: string) => void;
  recargarGarzones: () => void;

  // Propinas
  propinas: Propina[];
  guardarPropina: (propina: Propina) => void;
  eliminarPropina: (indexOrId: number | string) => void;
  recargarPropinas: () => void;
  exportarCSV: () => void;

  // Global Notification / Toast
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storageService = StorageService.getInstance();

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedGarzonName, setSelectedGarzonName] = useState<string | null>(null);

  const [configuracion, setConfiguracion] = useState<Configuracion>(() =>
    storageService.getConfiguracion()
  );

  const [garzones, setGarzones] = useState<Garzon[]>(() => storageService.getGarzones());
  const [propinas, setPropinas] = useState<Propina[]>(() => storageService.getPropinas());

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showNotification = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setNotification({ message, type });
      setTimeout(() => {
        setNotification((curr) => (curr?.message === message ? null : curr));
      }, 3500);
    },
    []
  );

  // Sync theme mode with document
  useEffect(() => {
    const isDark =
      configuracion.themeMode === 'dark' ||
      (configuracion.themeMode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [configuracion.themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    const updated = storageService.guardarConfiguracion({
      themeMode: mode,
      modoOscuro: mode === 'dark',
    });
    setConfiguracion(updated);
  };

  const guardarConfiguracion = (config: Partial<Configuracion>) => {
    const updated = storageService.guardarConfiguracion(config);
    setConfiguracion(updated);
    storageService.registrarAuditoria('cambioConfiguracion', 'Configuración de porcentajes actualizada');
    showNotification('Configuración guardada correctamente', 'success');
  };

  const restaurarValoresPredeterminados = () => {
    const defaults = storageService.restaurarConfiguracionPredeterminada();
    setConfiguracion(defaults);
    showNotification('Valores predeterminados restaurados', 'info');
  };

  // Garzones operations
  const porcentajeTotalGarzones = garzones.reduce((sum, g) => sum + g.porcentaje, 0);
  const esPorcentajeValido = porcentajeTotalGarzones <= 100.0;

  const agregarGarzon = (nuevo: Garzon): { success: boolean; error?: string } => {
    if (!nuevo.nombre.trim()) {
      return { success: false, error: 'El nombre no puede estar vacío' };
    }
    if (nuevo.porcentaje < 0) {
      return { success: false, error: 'El porcentaje no puede ser negativo' };
    }
    if (garzones.some((g) => g.nombre.toLowerCase() === nuevo.nombre.trim().toLowerCase())) {
      return { success: false, error: 'Ya existe un garzón con este nombre' };
    }

    const nuevosGarzones = [...garzones, { nombre: nuevo.nombre.trim(), porcentaje: nuevo.porcentaje }];
    const nuevoTotal = nuevosGarzones.reduce((sum, g) => sum + g.porcentaje, 0);

    if (nuevoTotal > 100.0) {
      return { success: false, error: '¡Error! El porcentaje total excede el 100%' };
    }

    storageService.guardarGarzones(nuevosGarzones);
    setGarzones(nuevosGarzones);
    storageService.registrarAuditoria(
      'gestionGarzon',
      `Garzón agregado: ${nuevo.nombre} (${nuevo.porcentaje}%)`
    );
    showNotification('Garzón agregado correctamente', 'success');
    return { success: true };
  };

  const actualizarGarzon = (
    nombreAntiguo: string,
    garzonActualizado: Garzon
  ): { success: boolean; error?: string } => {
    if (!garzonActualizado.nombre.trim()) {
      return { success: false, error: 'El nombre no puede estar vacío' };
    }
    if (garzonActualizado.porcentaje < 0) {
      return { success: false, error: 'El porcentaje no puede ser negativo' };
    }

    const nuevosGarzones = garzones.map((g) =>
      g.nombre === nombreAntiguo ? { ...garzonActualizado, nombre: garzonActualizado.nombre.trim() } : g
    );

    const nuevoTotal = nuevosGarzones.reduce((sum, g) => sum + g.porcentaje, 0);
    if (nuevoTotal > 100.0) {
      return { success: false, error: '¡Error! El porcentaje total excede el 100%' };
    }

    storageService.guardarGarzones(nuevosGarzones);
    setGarzones(nuevosGarzones);
    storageService.registrarAuditoria(
      'gestionGarzon',
      `Garzón actualizado: ${garzonActualizado.nombre} (${garzonActualizado.porcentaje}%)`
    );
    showNotification('Garzón actualizado correctamente', 'success');
    return { success: true };
  };

  const eliminarGarzon = (nombre: string) => {
    const nuevosGarzones = garzones.filter((g) => g.nombre !== nombre);
    storageService.guardarGarzones(nuevosGarzones);
    setGarzones(nuevosGarzones);
    storageService.registrarAuditoria('gestionGarzon', `Garzón eliminado: ${nombre}`);
    showNotification('Garzón eliminado correctamente', 'info');
  };

  const recargarGarzones = () => {
    setGarzones(storageService.getGarzones());
    showNotification('Lista de garzones recargada', 'info');
  };

  // Propinas operations
  const guardarPropina = (propina: Propina) => {
    storageService.guardarPropina(propina);
    setPropinas(storageService.getPropinas());
  };

  const eliminarPropina = (indexOrId: number | string) => {
    storageService.eliminarPropina(indexOrId);
    setPropinas(storageService.getPropinas());
    showNotification('Propina eliminada del historial', 'info');
  };

  const recargarPropinas = () => {
    setPropinas(storageService.getPropinas());
  };

  const exportarCSV = () => {
    const csvContent = storageService.generarCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historial_propinas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Archivo CSV exportado exitosamente', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        selectedGarzonName,
        setSelectedGarzonName,
        configuracion,
        guardarConfiguracion,
        restaurarValoresPredeterminados,
        setThemeMode,
        garzones,
        porcentajeTotalGarzones,
        esPorcentajeValido,
        agregarGarzon,
        actualizarGarzon,
        eliminarGarzon,
        recargarGarzones,
        propinas,
        guardarPropina,
        eliminarPropina,
        recargarPropinas,
        exportarCSV,
        notification,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  return context;
};
