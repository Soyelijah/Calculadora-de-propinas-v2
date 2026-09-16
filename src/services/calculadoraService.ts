import { ModoDistribucion, Propina, DetalleDistribucion, DesgloseGarzonCalculo } from '../types';

export class PorcentajesInvalidosError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PorcentajesInvalidosError';
  }
}

export class ValoresNegativosError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValoresNegativosError';
  }
}

export class SinGarzonesError extends Error {
  constructor(message = 'Debe haber al menos un garzón configurado') {
    super(message);
    this.name = 'SinGarzonesError';
  }
}

export interface CalculoParametros {
  montoTotal: number;
  porcentajeTransbank: number;
  porcentajeCocina: number;
  porcentajesGarzones: Record<string, number>;
  modoDistribucion?: ModoDistribucion;
}

export class CalculadoraPropinaService {
  /**
   * Calcula la distribución de propinas según los parámetros dados y el modo seleccionado:
   * 
   * Modo 'proporcional_remanente':
   * 1. Transbank = montoTotal * (porcentajeTransbank / 100)
   * 2. Subtotal = montoTotal - Transbank
   * 3. Cocina = subtotal * (porcentajeCocina / 100)
   * 4. Fondo Garzones = subtotal - Cocina
   * 5. Cada garzón recibe su proporción relativa de los puntos:
   *    monto = fondoGarzones * (puntosGarzon / sumaPuntosGarzones)
   * 
   * Modo 'porcentaje_directo':
   * 1. Transbank = montoTotal * (porcentajeTransbank / 100)
   * 2. Subtotal = montoTotal - Transbank
   * 3. Cocina = subtotal * (porcentajeCocina / 100)
   * 4. Cada garzón recibe: subtotal * (porcentaje / 100)
   * 5. Remanente no asignado = Fondo Garzones - sumaMontosGarzones
   */
  public calcular(params: CalculoParametros): Propina {
    const {
      montoTotal,
      porcentajeTransbank,
      porcentajeCocina,
      porcentajesGarzones,
      modoDistribucion = 'proporcional_remanente',
    } = params;

    // Validaciones de entrada
    this.validarEntradas(montoTotal, porcentajeTransbank, porcentajeCocina, porcentajesGarzones);

    const sumaGarzones = Object.values(porcentajesGarzones).reduce((acc, val) => acc + val, 0);

    // Deducción Transbank sobre monto total
    const montoTransbank = montoTotal * (porcentajeTransbank / 100);
    const subtotal = montoTotal - montoTransbank;

    // Deducción Cocina sobre subtotal post-Transbank
    const montoCocina = subtotal * (porcentajeCocina / 100);
    const fondoGarzonesDisponible = Math.max(0, subtotal - montoCocina);

    // Sistema de puntos: cada 100% equivale a 1.0 punto (75% = 0.75 pt, 50% = 0.5 pt)
    const puntosTotalesGarzones = sumaGarzones / 100;
    const valorPorPunto =
      modoDistribucion === 'proporcional_remanente' && puntosTotalesGarzones > 0
        ? fondoGarzonesDisponible / puntosTotalesGarzones
        : 0;

    const montosPorGarzon: Record<string, number> = {};
    let montoRemanenteNoAsignado = 0;

    if (modoDistribucion === 'proporcional_remanente') {
      if (sumaGarzones <= 0) {
        throw new PorcentajesInvalidosError('La suma de ponderaciones de los garzones debe ser mayor a 0');
      }

      for (const [nombre, porcentaje] of Object.entries(porcentajesGarzones)) {
        const puntos = porcentaje / 100;
        montosPorGarzon[nombre] = puntos * valorPorPunto;
      }
      montoRemanenteNoAsignado = 0;
    } else {
      // Modo porcentaje directo del subtotal
      const porcentajeMaximoGarzones = 100 - porcentajeCocina;
      if (sumaGarzones > porcentajeMaximoGarzones) {
        throw new PorcentajesInvalidosError(
          `La suma de garzones (${sumaGarzones.toFixed(1)}%) supera el remanente disponible post-cocina (${porcentajeMaximoGarzones.toFixed(1)}%)`
        );
      }

      let sumaMontosGarzones = 0;
      for (const [nombre, porcentaje] of Object.entries(porcentajesGarzones)) {
        const montoG = subtotal * (porcentaje / 100);
        montosPorGarzon[nombre] = montoG;
        sumaMontosGarzones += montoG;
      }

      montoRemanenteNoAsignado = Math.max(0, fondoGarzonesDisponible - sumaMontosGarzones);
    }

    const propina: Propina = {
      id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fecha: new Date().toISOString(),
      montoTotal,
      montoTransbank,
      montoCocina,
      porcentajeTransbank,
      porcentajeCocina,
      montosPorGarzon,
      modoDistribucion,
      montoRemanenteNoAsignado,
      puntosTotalesGarzones,
      valorPorPunto,
    };

    // Validar coherencia matemática
    if (!this.validarPropina(propina)) {
      throw new Error('La propina calculada contiene valores inconsistentes con el monto total');
    }

    return propina;
  }

  /**
   * Genera un desglose detallado y transparente para visualización en pantalla
   */
  public obtenerDetalleCompleto(
    arg1: CalculoParametros | Propina,
    arg2?: Record<string, number>
  ): DetalleDistribucion {
    let propina: Propina;
    let porcentajesGarzones: Record<string, number>;

    if ('id' in arg1) {
      // Called with (propina, porcentajesGarzones)
      propina = arg1;
      porcentajesGarzones = arg2 || {};
    } else {
      // Called with CalculoParametros
      porcentajesGarzones = arg1.porcentajesGarzones;
      propina = this.calcular(arg1);
    }

    const subtotal = propina.montoTotal - propina.montoTransbank;
    const fondoGarzonesDisponible = subtotal - propina.montoCocina;

    const sumaGarzones = Object.values(porcentajesGarzones).reduce((acc, val) => acc + val, 0);
    const puntosTotalesGarzones =
      propina.puntosTotalesGarzones ?? (sumaGarzones > 0 ? sumaGarzones / 100 : 0);
    const valorPorPunto =
      propina.valorPorPunto ??
      (puntosTotalesGarzones > 0 ? fondoGarzonesDisponible / puntosTotalesGarzones : 0);

    const desgloseGarzones: DesgloseGarzonCalculo[] = [];
    for (const [nombre, monto] of Object.entries(propina.montosPorGarzon)) {
      const pctConfig = porcentajesGarzones[nombre] ?? 0;
      const puntos = pctConfig / 100;
      const pctEfectivo = propina.montoTotal > 0 ? (monto / propina.montoTotal) * 100 : 0;
      const pctFondo = fondoGarzonesDisponible > 0 ? (monto / fondoGarzonesDisponible) * 100 : 0;

      desgloseGarzones.push({
        nombre,
        porcentajeConfigurado: pctConfig,
        puntos,
        porcentajeEfectivoDelTotal: pctEfectivo,
        porcentajeFondoGarzones: pctFondo,
        montoAsignado: monto,
      });
    }

    return {
      montoTotal: propina.montoTotal,
      montoTransbank: propina.montoTransbank,
      subtotal,
      montoCocina: propina.montoCocina,
      fondoGarzonesDisponible,
      puntosTotalesGarzones,
      valorPorPunto,
      garzones: desgloseGarzones,
      remanenteNoAsignado: propina.montoRemanenteNoAsignado || 0,
    };
  }

  public validarEntradas(
    montoTotal: number,
    porcentajeTransbank: number,
    porcentajeCocina: number,
    porcentajesGarzones: Record<string, number>
  ) {
    if (!Number.isFinite(montoTotal)) {
      throw new ValoresNegativosError('El monto total debe ser un número finito');
    }
    if (!Number.isFinite(porcentajeTransbank)) {
      throw new PorcentajesInvalidosError('El porcentaje de Transbank debe ser un número finito');
    }
    if (!Number.isFinite(porcentajeCocina)) {
      throw new PorcentajesInvalidosError('El porcentaje de Cocina debe ser un número finito');
    }
    if (montoTotal <= 0) {
      throw new ValoresNegativosError('El monto total debe ser mayor a 0');
    }
    if (porcentajeTransbank < 0) {
      throw new ValoresNegativosError('El porcentaje de Transbank no puede ser negativo');
    }
    if (porcentajeTransbank >= 100) {
      throw new PorcentajesInvalidosError('El porcentaje de Transbank debe ser menor a 100%');
    }
    if (porcentajeCocina < 0) {
      throw new ValoresNegativosError('El porcentaje de Cocina no puede ser negativo');
    }
    if (porcentajeCocina >= 100) {
      throw new PorcentajesInvalidosError('El porcentaje de Cocina debe ser menor a 100%');
    }
    if (porcentajeTransbank + porcentajeCocina >= 100) {
      throw new PorcentajesInvalidosError('La suma de deducciones base (Transbank + Cocina) no puede exceder el 100%');
    }

    const entries = Object.entries(porcentajesGarzones);
    if (entries.length === 0) {
      throw new SinGarzonesError('Debe haber al menos un garzón configurado');
    }

    for (const [nombre, porcentaje] of entries) {
      if (!nombre || nombre.trim() === '') {
        throw new Error('Los nombres de los garzones no pueden estar vacíos');
      }
      if (!Number.isFinite(porcentaje)) {
        throw new PorcentajesInvalidosError(`El porcentaje para ${nombre} debe ser un número finito`);
      }
      if (porcentaje < 0) {
        throw new ValoresNegativosError(`El porcentaje para ${nombre} no puede ser negativo`);
      }
      if (porcentaje > 100) {
        throw new PorcentajesInvalidosError(`El porcentaje para ${nombre} no puede exceder 100%`);
      }
    }
  }

  private validarPropina(propina: Propina): boolean {
    if (propina.montoTotal < 0 || propina.montoTransbank < 0 || propina.montoCocina < 0) {
      return false;
    }

    for (const monto of Object.values(propina.montosPorGarzon)) {
      if (monto < 0) return false;
    }

    const totalDistribuido =
      propina.montoTransbank +
      propina.montoCocina +
      Object.values(propina.montosPorGarzon).reduce((a, b) => a + b, 0) +
      (propina.montoRemanenteNoAsignado || 0);

    return Math.abs(totalDistribuido - propina.montoTotal) < 0.1;
  }
}
