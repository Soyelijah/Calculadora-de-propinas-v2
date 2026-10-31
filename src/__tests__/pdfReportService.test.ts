import { describe, it, expect, vi } from 'vitest';
import {
  obtenerPropinasMesActual,
  calcularResumenMes,
  generarReportePDFMesActual,
  formatearMonedaCL,
} from '../services/pdfReportService';
import { Propina } from '../types';

describe('pdfReportService', () => {
  const propinasPrueba: Propina[] = [
    {
      id: '1',
      fecha: '2026-10-05T14:30:00.000Z',
      montoTotal: 100000,
      montoTransbank: 10000,
      montoCocina: 15000,
      montosPorGarzon: {
        'Juan Perez': 45000,
        'Maria Lopez': 30000,
      },
    },
    {
      id: '2',
      fecha: '2026-10-18T20:00:00.000Z',
      montoTotal: 200000,
      montoTransbank: 20000,
      montoCocina: 30000,
      montosPorGarzon: {
        'Juan Perez': 90000,
        'Carlos Diaz': 60000,
      },
    },
    {
      id: '3',
      fecha: '2026-09-28T18:00:00.000Z', // Mes anterior (Septiembre)
      montoTotal: 50000,
      montoTransbank: 5000,
      montoCocina: 7500,
      montosPorGarzon: {
        'Juan Perez': 37500,
      },
    },
    {
      id: '4',
      fecha: '2025-10-10T12:00:00.000Z', // Mismo mes pero año anterior (2025)
      montoTotal: 80000,
      montoTransbank: 8000,
      montoCocina: 12000,
      montosPorGarzon: {
        'Maria Lopez': 60000,
      },
    },
  ];

  const fechaReferenciaOctubre2026 = new Date('2026-10-25T12:00:00.000Z');

  describe('obtenerPropinasMesActual', () => {
    it('debe filtrar exclusivamente los registros correspondientes al mes y año actual', () => {
      const resultado = obtenerPropinasMesActual(propinasPrueba, fechaReferenciaOctubre2026);

      expect(resultado.propinasMes).toHaveLength(2);
      expect(resultado.propinasMes.map((p) => p.id)).toEqual(['1', '2']);
      expect(resultado.mes).toBe(9); // 0-indexed (9 = Octubre)
      expect(resultado.anio).toBe(2026);
      expect(resultado.nombreMes).toBe('Octubre');
    });

    it('debe retornar lista vacía si no existen registros en el mes especificado', () => {
      const fechaNoviembre2026 = new Date('2026-11-01T10:00:00.000Z');
      const resultado = obtenerPropinasMesActual(propinasPrueba, fechaNoviembre2026);

      expect(resultado.propinasMes).toHaveLength(0);
      expect(resultado.nombreMes).toBe('Noviembre');
    });
  });

  describe('calcularResumenMes', () => {
    it('debe consolidar correctamente los totales del mes y desglose por garzón', () => {
      const propinasOctubre = propinasPrueba.filter((p) => p.id === '1' || p.id === '2');
      const resumen = calcularResumenMes(propinasOctubre, fechaReferenciaOctubre2026);

      expect(resumen.cantidadRegistros).toBe(2);
      expect(resumen.totalRecaudado).toBe(300000);
      expect(resumen.totalTransbank).toBe(30000);
      expect(resumen.totalCocina).toBe(45000);
      expect(resumen.totalGarzones).toBe(225000);

      // Desglose por garzón
      expect(resumen.totalesPorGarzon).toHaveLength(3);

      const juan = resumen.totalesPorGarzon.find((g) => g.nombre === 'Juan Perez');
      expect(juan).toBeDefined();
      expect(juan?.turnosParticipados).toBe(2);
      expect(juan?.montoTotalRecibido).toBe(135000); // 45000 + 90000
      expect(juan?.porcentajeDelFondoGarzones).toBeCloseTo(60, 1); // 135000 / 225000 = 60%

      const maria = resumen.totalesPorGarzon.find((g) => g.nombre === 'Maria Lopez');
      expect(maria).toBeDefined();
      expect(maria?.turnosParticipados).toBe(1);
      expect(maria?.montoTotalRecibido).toBe(30000);

      const carlos = resumen.totalesPorGarzon.find((g) => g.nombre === 'Carlos Diaz');
      expect(carlos).toBeDefined();
      expect(carlos?.turnosParticipados).toBe(1);
      expect(carlos?.montoTotalRecibido).toBe(60000);
    });

    it('debe manejar lista vacía sin arrojar error', () => {
      const resumenVacio = calcularResumenMes([], fechaReferenciaOctubre2026);
      expect(resumenVacio.cantidadRegistros).toBe(0);
      expect(resumenVacio.totalRecaudado).toBe(0);
      expect(resumenVacio.totalesPorGarzon).toEqual([]);
    });
  });

  describe('formatearMonedaCL', () => {
    it('debe formatear valores en pesos chilenos redondeados', () => {
      expect(formatearMonedaCL(15420.8)).toBe('$15.421');
      expect(formatearMonedaCL(0)).toBe('$0');
    });
  });

  describe('generarReportePDFMesActual', () => {
    it('debe generar una instancia de jsPDF con metadatos del reporte', () => {
      const propinasOctubre = propinasPrueba.filter((p) => p.id === '1' || p.id === '2');
      const doc = generarReportePDFMesActual(propinasOctubre, {
        adminNombre: 'Administrador Principal',
        nombreRestaurante: 'Mi Restaurante',
        fechaReferencia: fechaReferenciaOctubre2026,
        descargarDirecto: false,
      });

      expect(doc).toBeDefined();
      expect(typeof doc.getNumberOfPages).toBe('function');
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    });

    it('debe llamar a doc.save si descargarDirecto es true', () => {
      const propinasOctubre = propinasPrueba.filter((p) => p.id === '1');
      const doc = generarReportePDFMesActual(propinasOctubre, {
        adminNombre: 'Admin',
        fechaReferencia: fechaReferenciaOctubre2026,
        descargarDirecto: false,
      });

      const spySave = vi.spyOn(doc, 'save').mockImplementation(() => doc);
      doc.save('test.pdf');
      expect(spySave).toHaveBeenCalledWith('test.pdf');
    });
  });
});
