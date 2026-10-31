import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistorialScreen } from '../screens/HistorialScreen';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import * as pdfService from '../services/pdfReportService';

describe('HistorialScreen - Exportar PDF Mes Actual', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('permite al administrador abrir la vista previa y exportar el PDF del mes', async () => {
    const storage = StorageService.getInstance();
    // Guardar usuario administrador en sesión
    sessionStorage.setItem('calculadora_usuario_sesion', JSON.stringify({ nombre: 'Admin Boss', rol: 'admin' }));

    // Crear propinas del mes actual
    const now = new Date();
    storage.guardarPropina({
      id: 'prop-1',
      fecha: now.toISOString(),
      montoTotal: 150000,
      montoTransbank: 15000,
      montoCocina: 20000,
      montosPorGarzon: {
        'Carlos': 65000,
        'Lucia': 50000,
      },
    });

    render(
      <AuthProvider>
        <AppProvider>
          <HistorialScreen />
        </AppProvider>
      </AuthProvider>
    );

    // Debe mostrar el botón de PDF del mes
    const botonPDF = screen.getByTitle(/Ver, imprimir o descargar reporte en PDF/i);
    expect(botonPDF).toBeDefined();

    // Al hacer click, debe abrir el modal de Reporte Mensual
    fireEvent.click(botonPDF);

    expect(screen.getByText('Reporte Mensual de Propinas')).toBeDefined();
    expect(screen.getByText(/Consolidado Acumulado por Garzón/i)).toBeDefined();
    expect(screen.getByText('Carlos')).toBeDefined();
    expect(screen.getByText('Lucia')).toBeDefined();

    // Espiar la función de generación de PDF
    const spyGenerar = vi.spyOn(pdfService, 'generarReportePDFMesActual');
    const botonDescargar = screen.getByRole('button', { name: /Descargar PDF/i });
    fireEvent.click(botonDescargar);

    expect(spyGenerar).toHaveBeenCalledTimes(1);
  });

  it('bloquea la exportación de PDF y muestra advertencia si el usuario es garzón (no admin)', async () => {
    // Guardar usuario garzon en sesión
    sessionStorage.setItem('calculadora_usuario_sesion', JSON.stringify({ nombre: 'Mozo Pedro', rol: 'garzon' }));

    render(
      <AuthProvider>
        <AppProvider>
          <HistorialScreen />
        </AppProvider>
      </AuthProvider>
    );

    const botonPDF = screen.getByTitle(/Ver, imprimir o descargar reporte en PDF/i);
    fireEvent.click(botonPDF);

    // El modal de PDF no debe estar abierto
    expect(screen.queryByText('Reporte Mensual de Propinas')).toBeNull();
  });

});
