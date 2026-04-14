import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Factura, Pedido } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PdfService {

  /**
   * Genera proforma o comprobante de compra a partir de un Pedido.
   * Muestra desglose de subtotal, descuento, IVA 13% y envío.
   */
  generarProforma(pedido: Pedido, cliente: string) {
    const doc = new jsPDF();
    const fmt = (n: number) => `₡${(n || 0).toLocaleString('es-CR')}`;

    doc.setFontSize(18);
    doc.setTextColor(45, 99, 226);
    doc.text('Tienda Virtual CR', 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(pedido.esProforma ? 'PROFORMA DE COMPRA' : 'COMPROBANTE DE COMPRA', 14, 26);

    doc.setFontSize(9);
    doc.text(`N.° Pedido: ${pedido.pedidoId}`, 14, 36);
    doc.text(`Fecha: ${new Date(pedido.fecha).toLocaleString('es-CR')}`, 14, 42);
    doc.text(`Cliente: ${cliente}`, 14, 48);
    doc.text(`Método de pago: ${pedido.metodoPago}`, 14, 54);
    doc.text(`Estado: ${pedido.estado}`, 14, 60);
    if (pedido.direccionEnvio) {
      const lineas = doc.splitTextToSize(`Dirección envío: ${pedido.direccionEnvio}`, 180);
      doc.text(lineas, 14, 66);
    }

    const startY = pedido.direccionEnvio ? 80 : 72;

    autoTable(doc, {
      startY,
      head: [['Producto', 'Cant.', 'Precio', 'Subtotal']],
      body: pedido.detalles.map(d => [
        d.nombreProducto,
        String(d.cantidad),
        fmt(d.precioUnitario),
        fmt(d.subtotal)
      ]),
      theme: 'striped',
      headStyles: { fillColor: [45, 99, 226] },
      styles: { fontSize: 9 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || startY + 10;
    let y = finalY + 10;
    doc.setFontSize(10);

    const col1 = 120, col2 = 196;
    const print = (label: string, value: string, bold = false) => {
      if (bold) doc.setFont('helvetica', 'bold');
      else doc.setFont('helvetica', 'normal');
      doc.text(label, col1, y);
      doc.text(value, col2, y, { align: 'right' });
      y += 6;
    };

    print('Subtotal', fmt(pedido.subtotal));
    if (pedido.descuento > 0) print(`Descuento${pedido.codigoCupon ? ' (' + pedido.codigoCupon + ')' : ''}`, '- ' + fmt(pedido.descuento));
    print('IVA 13%', fmt(pedido.iva));
    if (pedido.costoEnvio > 0) print('Envío', fmt(pedido.costoEnvio));
    else print('Envío', 'GRATIS');
    y += 2;
    print('TOTAL', fmt(pedido.total), true);

    if (pedido.numeroFactura) {
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Factura electrónica: ${pedido.numeroFactura}`, 14, y);
    }

    doc.save(`pedido_${pedido.pedidoId}.pdf`);
  }

  /**
   * Factura electrónica con desglose formal (subtotal, descuento, base imponible,
   * IVA 13%, envío, total). Cumple el formato de FE-CR para fines demostrativos.
   */
  generarFactura(factura: Factura) {
    const doc = new jsPDF();
    const fmt = (n: number) => `₡${(n || 0).toLocaleString('es-CR')}`;

    doc.setFontSize(16);
    doc.setTextColor(45, 99, 226);
    doc.text('FACTURA ELECTRÓNICA', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Tienda Virtual CR · Cédula jurídica 3-101-000000', 14, 25);

    doc.setFontSize(9);
    doc.text(`N.° consecutivo: ${factura.numeroConsecutivo}`, 14, 36);
    if (factura.claveNumerica) doc.text(`Clave numérica: ${factura.claveNumerica}`, 14, 42);
    doc.text(`Fecha emisión: ${new Date(factura.fechaEmision).toLocaleString('es-CR')}`, 14, 48);
    doc.text(`Pedido asociado: #${factura.pedidoId}`, 14, 54);

    doc.setFont('helvetica', 'bold');
    doc.text('Cliente', 14, 66);
    doc.setFont('helvetica', 'normal');
    doc.text(factura.usuarioNombre, 14, 72);
    if (factura.usuarioEmail) doc.text(factura.usuarioEmail, 14, 78);

    autoTable(doc, {
      startY: 86,
      head: [['Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
      body: factura.detalles.map(d => [
        d.nombreProducto,
        String(d.cantidad),
        fmt(d.precioUnitario),
        fmt(d.subtotal)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [45, 99, 226] },
      styles: { fontSize: 9 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    let y = finalY + 10;
    doc.setFontSize(10);

    const col1 = 120, col2 = 196;
    const print = (label: string, value: string, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.text(label, col1, y);
      doc.text(value, col2, y, { align: 'right' });
      y += 6;
    };

    print('Subtotal', fmt(factura.subtotal));
    if (factura.descuento > 0) print('Descuento', '- ' + fmt(factura.descuento));
    print('Base imponible', fmt(factura.baseImponible));
    print('IVA 13%', fmt(factura.iva));
    if (factura.costoEnvio > 0) print('Costo de envío', fmt(factura.costoEnvio));
    y += 2;
    print('TOTAL A PAGAR', fmt(factura.total), true);

    y += 12;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Documento emitido electrónicamente conforme al régimen tributario de Costa Rica.', 14, y);
    doc.text('Impuesto al Valor Agregado del 13% incluido en el total.', 14, y + 5);

    doc.save(`factura_${factura.numeroConsecutivo}.pdf`);
  }
}
