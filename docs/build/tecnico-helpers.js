// Helpers compartidos para el documento técnico
const {
  Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType,
  BorderStyle, WidthType, ShadingType, HeadingLevel, PageBreak, LevelFormat
} = require('docx');

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 };

const p = (text, opts = {}) => new Paragraph({
  spacing: { line: 360, after: 120 },
  alignment: opts.align || AlignmentType.JUSTIFIED,
  children: [new TextRun({
    text, bold: opts.bold, italics: opts.italics,
    size: opts.size || 24, color: opts.color, font: 'Arial'
  })],
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 200 },
  pageBreakBefore: true,
  children: [new TextRun({ text, bold: true, size: 36, color: '1F3864', font: 'Arial' })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 140 },
  children: [new TextRun({ text, bold: true, size: 28, color: '2E75B6', font: 'Arial' })],
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 220, after: 120 },
  children: [new TextRun({ text, bold: true, size: 24, color: '2E75B6', font: 'Arial' })],
});

const bullet = (text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { line: 320, after: 60 },
  children: [new TextRun({ text, size: 24, font: 'Arial' })],
});

const numbered = (text) => new Paragraph({
  numbering: { reference: 'numbers', level: 0 },
  spacing: { line: 320, after: 60 },
  children: [new TextRun({ text, size: 24, font: 'Arial' })],
});

const code = (text) => new Paragraph({
  spacing: { line: 260, after: 40 },
  shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
  children: [new TextRun({ text, size: 18, font: 'Consolas' })],
});

const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

function table(headers, rows, widths) {
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders: BORDERS,
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: '1F3864', type: ShadingType.CLEAR },
      margins: CELL_MARGINS,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 22, font: 'Arial' })],
      })],
    })),
  });
  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, i) => new TableCell({
      borders: BORDERS,
      width: { size: widths[i], type: WidthType.DXA },
      shading: ri % 2 === 0
        ? { fill: 'FFFFFF', type: ShadingType.CLEAR }
        : { fill: 'F4F8FB', type: ShadingType.CLEAR },
      margins: CELL_MARGINS,
      children: String(cell).split('\n').map(line =>
        new Paragraph({ children: [new TextRun({ text: line, size: 20, font: 'Arial' })] })
      ),
    })),
  }));
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: [headerRow, ...dataRows],
  });
}

module.exports = { p, h1, h2, h3, bullet, numbered, code, pageBreak, table };
