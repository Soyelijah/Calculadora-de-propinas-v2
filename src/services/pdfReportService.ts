import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Propina } from '../types';

export interface ResumenMesGarzon {
  nombre: string;
  turnosParticipados: number;
  montoTotalRecibido: number;
  porcentajeDelFondoGarzones: number;
}

export interface ResumenMesActual {
  nombreMes: string;
  anio: number;
  cantidadRegistros: number;
  totalRecaudado: number;
  totalTransbank: number;
  totalCocina: number;
  totalGarzones: number;
  totalRemanente: number;
  totalesPorGarzon: ResumenMesGarzon[];
  registros: Propina[];
}

const NOMBRES_MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/**
 * Filtra los registros de propinas pertenecientes al mes y año actual
 */
export const obtenerPropinasMesActual = (
  propinas: Propina[],
  fechaReferencia: Date = new Date()
): { propinasMes: Propina[]; mes: number; anio: number; nombreMes: string } => {
  const mesActual = fechaReferencia.getMonth();
  const anioActual = fechaReferencia.getFullYear();

  const propinasMes = propinas.filter((p) => {
    const d = new Date(p.fecha);
    return d.getMonth() === mesActual && d.getFullYear() === anioActual;
  });

  return {
    propinasMes,
    mes: mesActual,
    anio: anioActual,
    nombreMes: NOMBRES_MESES[mesActual] || 'Mes Actual',
  };
};

/**
 * Calcula los totales consolidados del mes
 */
export const calcularResumenMes = (
  propinasMes: Propina[],
  fechaReferencia: Date = new Date()
): ResumenMesActual => {
  const mesIndex = fechaReferencia.getMonth();
  const anio = fechaReferencia.getFullYear();
  const nombreMes = NOMBRES_MESES[mesIndex] || 'Mes Actual';

  let totalRecaudado = 0;
  let totalTransbank = 0;
  let totalCocina = 0;
  let totalGarzones = 0;
  let totalRemanente = 0;

  const conteoTurnosPorGarzon: Record<string, number> = {};
  const acumuladoMontoPorGarzon: Record<string, number> = {};

  // Ordenar de más antiguo a más reciente para el detalle mensual
  const registrosOrdenados = [...propinasMes].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  for (const propina of registrosOrdenados) {
    totalRecaudado += propina.montoTotal;
    totalTransbank += propina.montoTransbank;
    totalCocina += propina.montoCocina;
    totalRemanente += propina.montoRemanenteNoAsignado || 0;

    Object.entries(propina.montosPorGarzon).forEach(([nombre, monto]) => {
      totalGarzones += monto;
      conteoTurnosPorGarzon[nombre] = (conteoTurnosPorGarzon[nombre] || 0) + 1;
      acumuladoMontoPorGarzon[nombre] = (acumuladoMontoPorGarzon[nombre] || 0) + monto;
    });
  }

  const totalesPorGarzon: ResumenMesGarzon[] = Object.entries(acumuladoMontoPorGarzon)
    .map(([nombre, montoTotalRecibido]) => ({
      nombre,
      turnosParticipados: conteoTurnosPorGarzon[nombre] || 0,
      montoTotalRecibido,
      porcentajeDelFondoGarzones: totalGarzones > 0 ? (montoTotalRecibido / totalGarzones) * 100 : 0,
    }))
    .sort((a, b) => b.montoTotalRecibido - a.montoTotalRecibido);

  return {
    nombreMes,
    anio,
    cantidadRegistros: registrosOrdenados.length,
    totalRecaudado,
    totalTransbank,
    totalCocina,
    totalGarzones,
    totalRemanente,
    totalesPorGarzon,
    registros: registrosOrdenados,
  };
};

/**
 * Formato de moneda chilena sin decimales
 */
export const formatearMonedaCL = (valor: number): string => {
  return `$${Math.round(valor).toLocaleString('es-CL')}`;
};

/**
 * Genera el documento PDF de reporte mensual listo para descargar o imprimir
 */
export const generarReportePDFMesActual = (
  propinasMes: Propina[],
  opciones?: {
    adminNombre?: string;
    nombreRestaurante?: string;
    fechaReferencia?: Date;
    descargarDirecto?: boolean;
  }
): jsPDF => {
  const fechaRef = opciones?.fechaReferencia || new Date();
  const resumen = calcularResumenMes(propinasMes, fechaRef);
  const nombreAdmin = opciones?.adminNombre || 'Administrador';
  const nombreRestaurante = opciones?.nombreRestaurante || 'Sistema de Propinas';

  // Configuración del documento en orientación vertical, formato A4
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Encabezado Superior con estilo corporativo limpio
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(nombreRestaurante.toUpperCase(), margin, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('CONTROL Y GESTIÓN DE DISTRIBUCIÓN DE PROPINAS', margin, 18);

  const fechaGeneracion = new Date().toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generado: ${fechaGeneracion}`, pageWidth - margin, 11, { align: 'right' });
  doc.text(`Por: ${nombreAdmin}`, pageWidth - margin, 18, { align: 'right' });

  // Título del Reporte
  let currentY = 32;
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`Reporte Mensual de Distribución de Propinas`, margin, currentY);

  currentY += 6;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Período: ${resumen.nombreMes} ${resumen.anio} (${resumen.cantidadRegistros} registros procesados)`, margin, currentY);

  // Tarjetas de Resumen Ejecutivo / Totales
  currentY += 8;
  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 18;

  const metricas = [
    { label: 'TOTAL RECAUDADO', valor: formatearMonedaCL(resumen.totalRecaudado), color: [37, 99, 235] },
    { label: 'TRANSBANK', valor: formatearMonedaCL(resumen.totalTransbank), color: [2, 132, 199] },
    { label: 'COCINA', valor: formatearMonedaCL(resumen.totalCocina), color: [16, 185, 129] },
    { label: 'FONDO GARZONES', valor: formatearMonedaCL(resumen.totalGarzones), color: [99, 102, 241] },
  ];

  metricas.forEach((m, idx) => {
    const cardX = margin + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.label, cardX + 3, currentY + 5.5);

    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(m.valor, cardX + 3, currentY + 13.5);
  });

  currentY += cardHeight + 8;

  // Sección 1: Tabla Resumen Consolidado por Garzón
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('1. Consolidado Acumulado por Garzón', margin, currentY);

  currentY += 3;

  const filasGarzones = resumen.totalesPorGarzon.map((g, index) => [
    (index + 1).toString(),
    g.nombre,
    g.turnosParticipados.toString(),
    formatearMonedaCL(g.montoTotalRecibido),
    `${g.porcentajeDelFondoGarzones.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Nombre Garzón', 'Turnos', 'Monto Total Asignado', '% Fondo Garzones']],
    body: filasGarzones.length > 0 ? filasGarzones : [['-', 'Sin registros de garzones este mes', '-', '-', '-']],
    foot: [
      [
        '',
        'TOTAL ACUMULADO GARZONES',
        resumen.cantidadRegistros.toString(),
        formatearMonedaCL(resumen.totalGarzones),
        '100.0%',
      ],
    ],
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [51, 65, 85], // slate-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    footStyles: {
      fillColor: [241, 245, 249], // slate-100
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 35, halign: 'right' },
    },
  });

  // Sección 2: Detalle Cronológico de Turnos/Registros
  // Obtenemos la posición Y después de la primera tabla
  const finalYGarzones = (doc as any).lastAutoTable?.finalY || currentY + 40;
  let nextY = finalYGarzones + 9;

  // Si queda poco espacio en la página, iniciar en nueva página
  if (nextY > pageHeight - 55) {
    doc.addPage();
    nextY = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('2. Detalle Cronológico de Registros del Mes', margin, nextY);

  const filasDetalle = resumen.registros.map((p) => {
    const fechaTurno = new Date(p.fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const garzonesStr = Object.entries(p.montosPorGarzon)
      .map(([nom, monto]) => `${nom}: ${formatearMonedaCL(monto)}`)
      .join('\n');

    return [
      fechaTurno,
      formatearMonedaCL(p.montoTotal),
      formatearMonedaCL(p.montoTransbank),
      formatearMonedaCL(p.montoCocina),
      garzonesStr || 'Sin garzones',
    ];
  });

  autoTable(doc, {
    startY: nextY + 3,
    margin: { left: margin, right: margin },
    head: [['Fecha y Hora', 'Total', 'Transbank', 'Cocina', 'Distribución Garzones']],
    body: filasDetalle.length > 0 ? filasDetalle : [['-', 'No hay registros de turnos este mes', '-', '-', '-']],
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 26, halign: 'right' },
      2: { cellWidth: 26, halign: 'right' },
      3: { cellWidth: 26, halign: 'right' },
      4: { cellWidth: 'auto', fontSize: 7.5 },
    },
  });

  // Firma y pie de página en cada página
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Si es la última página, colocamos sección para firma si hay espacio
    if (i === totalPages) {
      const finalYDetalle = (doc as any).lastAutoTable?.finalY || 100;
      let firmaY = finalYDetalle + 20;

      // Si no cabe la firma al final, verificar si necesitamos nueva página o ponerla al final
      if (firmaY > pageHeight - 30) {
        doc.addPage();
        firmaY = 35;
      }

      doc.setDrawColor(148, 163, 184); // slate-400
      doc.line(margin + 20, firmaY, margin + 80, firmaY);
      doc.line(pageWidth - margin - 80, firmaY, pageWidth - margin - 20, firmaY);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Firma Administrador / Caja', margin + 50, firmaY + 4, { align: 'center' });
      doc.text('Firma Representante Garzones', pageWidth - margin - 50, firmaY + 4, { align: 'center' });
    }

    // Pie de página fijo
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Documento oficial de control interno - ${nombreRestaurante}`,
      margin,
      pageHeight - 7
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 7, {
      align: 'right',
    });
  }

  if (opciones?.descargarDirecto) {
    const mesNum = (resumen.registros[0] ? new Date(resumen.registros[0].fecha).getMonth() + 1 : fechaRef.getMonth() + 1)
      .toString()
      .padStart(2, '0');
    const anioNum = fechaRef.getFullYear();
    const nombreArchivo = `reporte_distribucion_propinas_${anioNum}_${mesNum}.pdf`;
    doc.save(nombreArchivo);
  }

  return doc;
};

/**
 * Imprime el documento PDF generado utilizando un iframe invisible en memoria
 * para evitar violaciones de popups o window.open en entornos sandbox.
 */
export const imprimirDocumentoPDF = (doc: jsPDF): void => {
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  iframe.src = blobUrl;
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Error al activar diálogo de impresión directo:', e);
    }
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      URL.revokeObjectURL(blobUrl);
    }, 3000);
  };
};

