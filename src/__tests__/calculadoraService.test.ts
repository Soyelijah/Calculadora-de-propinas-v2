import { describe, it, expect } from 'vitest';
import {
  CalculadoraPropinaService,
  formatPuntos,
  PorcentajesInvalidosError,
} from '../services/calculadoraService';

describe('CalculadoraPropinaService', () => {
  const calc = new CalculadoraPropinaService();

  describe('Validación de Parámetros', () => {
    it('debe rechazar montos totales menores o iguales a cero', () => {
      expect(() =>
        calc.calcular({
          montoTotal: 0,
          porcentajeTransbank: 3.5,
          porcentajeCocina: 10,
          porcentajesGarzones: { Ana: 50 },
        })
      ).toThrow('El monto total debe ser mayor a 0');

      expect(() =>
        calc.calcular({
          montoTotal: -1000,
          porcentajeTransbank: 3.5,
          porcentajeCocina: 10,
          porcentajesGarzones: { Ana: 50 },
        })
      ).toThrow('El monto total debe ser mayor a 0');
    });

    it('debe rechazar porcentajes negativos de Transbank o Cocina', () => {
      expect(() =>
        calc.calcular({
          montoTotal: 100000,
          porcentajeTransbank: -2,
          porcentajeCocina: 10,
          porcentajesGarzones: { Ana: 50 },
        })
      ).toThrow('El porcentaje de Transbank no puede ser negativo');

      expect(() =>
        calc.calcular({
          montoTotal: 100000,
          porcentajeTransbank: 3.5,
          porcentajeCocina: -5,
          porcentajesGarzones: { Ana: 50 },
        })
      ).toThrow('El porcentaje de Cocina no puede ser negativo');
    });

    it('debe rechazar cálculos sin garzones', () => {
      expect(() =>
        calc.calcular({
          montoTotal: 100000,
          porcentajeTransbank: 3.5,
          porcentajeCocina: 10,
          porcentajesGarzones: {},
        })
      ).toThrow('Debe haber al menos un garzón configurado');
    });

    it('debe rechazar si Transbank + Cocina supera el 100%', () => {
      expect(() =>
        calc.calcular({
          montoTotal: 100000,
          porcentajeTransbank: 50,
          porcentajeCocina: 60,
          porcentajesGarzones: { Ana: 50 },
        })
      ).toThrow('La suma de deducciones base (Transbank + Cocina) no puede exceder el 100%');
    });
  });

  describe('Modo: Proporcional Remanente', () => {
    it('debe distribuir equitativamente el fondo post-cocina entre dos garzones con ponderación idéntica', () => {
      // Monto: 100,000
      // Transbank (3.5%): 3,500. Subtotal: 96,500
      // Cocina (10% sobre 96,500): 9,650. Fondo Garzones: 86,850
      // Ana (50 pts) y Luis (50 pts): cada uno recibe 43,425 (50% de 86,850)
      const propina = calc.calcular({
        montoTotal: 100000,
        porcentajeTransbank: 3.5,
        porcentajeCocina: 10,
        porcentajesGarzones: { Ana: 50, Luis: 50 },
        modoDistribucion: 'proporcional_remanente',
      });

      expect(propina.montoTransbank).toBeCloseTo(3500, 2);
      expect(propina.montoCocina).toBeCloseTo(9650, 2);
      expect(propina.montosPorGarzon['Ana']).toBeCloseTo(43425, 2);
      expect(propina.montosPorGarzon['Luis']).toBeCloseTo(43425, 2);

      // Verificación de integridad: la suma de partes debe igualar al monto total
      const sumaPartes =
        propina.montoTransbank +
        propina.montoCocina +
        propina.montosPorGarzon['Ana'] +
        propina.montosPorGarzon['Luis'];
      expect(sumaPartes).toBeCloseTo(100000, 2);
    });

    it('debe distribuir con ponderación asimétrica (60/40) sin perder fondos', () => {
      const propina = calc.calcular({
        montoTotal: 50000,
        porcentajeTransbank: 0,
        porcentajeCocina: 0,
        porcentajesGarzones: { Ana: 60, Luis: 40 },
        modoDistribucion: 'proporcional_remanente',
      });

      expect(propina.montosPorGarzon['Ana']).toBe(30000);
      expect(propina.montosPorGarzon['Luis']).toBe(20000);
    });
  });

  describe('Modo: Porcentaje Directo', () => {
    it('debe calcular porcentajes directos sobre el fondo post-cocina (ej. Ana 30% y Luis 70% con Transbank y Cocina)', () => {
      // Caso exacto del usuario: 100,000, 3% Transbank, 10% Cocina, Ana 30%, Luis 70%
      // Transbank (3%): 3,000. Subtotal: 97,000
      // Cocina (10%): 9,700. Fondo disponible post-cocina: 87,300
      // Ana (30% = 0.30 pt): 87,300 * 0.30 = 26,190 (26.19% del total)
      // Luis (70% = 0.70 pt): 87,300 * 0.70 = 61,110 (61.11% del total)
      // Remanente no asignado: 0
      const detalle = calc.obtenerDetalleCompleto({
        montoTotal: 100000,
        porcentajeTransbank: 3,
        porcentajeCocina: 10,
        porcentajesGarzones: { Ana: 30, Luis: 70 },
        modoDistribucion: 'porcentaje_directo',
      });

      expect(detalle.montoTransbank).toBe(3000);
      expect(detalle.montoCocina).toBe(9700);
      expect(detalle.fondoGarzonesDisponible).toBe(87300);
      expect(detalle.garzones.find((g) => g.nombre === 'Ana')?.montoAsignado).toBe(26190);
      expect(detalle.garzones.find((g) => g.nombre === 'Luis')?.montoAsignado).toBe(61110);
      expect(detalle.remanenteNoAsignado).toBe(0);
    });

    it('debe calcular remanente no asignado cuando la suma es menor a 100%', () => {
      // Monto: 100,000, Transbank: 0%, Cocina: 10% (10,000) -> Fondo: 90,000
      // Ana 30%: 27,000; Luis 20%: 18,000 -> Remanente no asignado: 45,000
      const detalle = calc.obtenerDetalleCompleto({
        montoTotal: 100000,
        porcentajeTransbank: 0,
        porcentajeCocina: 10,
        porcentajesGarzones: { Ana: 30, Luis: 20 },
        modoDistribucion: 'porcentaje_directo',
      });

      expect(detalle.fondoGarzonesDisponible).toBe(90000);
      expect(detalle.garzones.find((g) => g.nombre === 'Ana')?.montoAsignado).toBe(27000);
      expect(detalle.garzones.find((g) => g.nombre === 'Luis')?.montoAsignado).toBe(18000);
      expect(detalle.remanenteNoAsignado).toBe(45000);
    });

    it('debe lanzar error si la suma de porcentajes de garzones supera el 100%', () => {
      expect(() =>
        calc.calcular({
          montoTotal: 100000,
          porcentajeTransbank: 3,
          porcentajeCocina: 10,
          porcentajesGarzones: { Ana: 60, Luis: 50 },
          modoDistribucion: 'porcentaje_directo',
        })
      ).toThrow(PorcentajesInvalidosError);
    });
  });

  describe('formatPuntos', () => {
    it('formatea correctamente los puntos solicitados por el usuario', () => {
      expect(formatPuntos(30)).toBe('0.30 pt');
      expect(formatPuntos(70)).toBe('0.70 pt');
      expect(formatPuntos(100)).toBe('1 pt');
      expect(formatPuntos(50)).toBe('0.50 pt');
      expect(formatPuntos(75)).toBe('0.75 pt');
      expect(formatPuntos(0)).toBe('0 pt');
      expect(formatPuntos(200)).toBe('2 pt');
      expect(formatPuntos(150)).toBe('1.50 pt');
    });
  });
});

