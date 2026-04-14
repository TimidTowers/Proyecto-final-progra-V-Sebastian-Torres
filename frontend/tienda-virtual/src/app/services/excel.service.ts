import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({ providedIn: 'root' })
export class ExcelService {
  /**
   * Exporta una colección de objetos plana como una única hoja de Excel.
   */
  exportar<T extends Record<string, any>>(filas: T[], nombreArchivo: string, hoja = 'Datos') {
    const worksheet = XLSX.utils.json_to_sheet(filas);
    const workbook: XLSX.WorkBook = { Sheets: { [hoja]: worksheet }, SheetNames: [hoja] };
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, nombreArchivo.endsWith('.xlsx') ? nombreArchivo : `${nombreArchivo}.xlsx`);
  }

  /**
   * Exporta varias hojas al mismo libro.
   */
  exportarMulti(hojas: { nombre: string; filas: Record<string, any>[] }[], nombreArchivo: string) {
    const workbook: XLSX.WorkBook = { Sheets: {}, SheetNames: [] };
    hojas.forEach(h => {
      workbook.Sheets[h.nombre] = XLSX.utils.json_to_sheet(h.filas);
      workbook.SheetNames.push(h.nombre);
    });
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, nombreArchivo.endsWith('.xlsx') ? nombreArchivo : `${nombreArchivo}.xlsx`);
  }
}
