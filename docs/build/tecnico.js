// Generador del Documento Técnico - Tienda Virtual CR
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Header, Footer, AlignmentType,
  BorderStyle, LevelFormat, PageNumber, TabStopType, TabStopPosition,
  TableOfContents, HeadingLevel, PageBreak
} = require('docx');

const { portada, controlVer, sec1, sec2, sec3 } = require('./tecnico-secciones-1-3');
const { sec4, sec5, sec6 } = require('./tecnico-secciones-4-6');
const { sec7 } = require('./tecnico-seccion-7');
const { sec7sql } = require('./tecnico-seccion-7-sql');
const { sec8 } = require('./tecnico-seccion-8');
const { sec9, sec10 } = require('./tecnico-secciones-9-10');

const indice = [
  new Paragraph({ heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text: 'Índice', bold: true, size: 36, color: '1F3864', font: 'Arial' })] }),
  new TableOfContents('Contenido del documento', { hyperlink: true, headingStyleRange: '1-3' }),
  new Paragraph({ children: [new PageBreak()] }),
];

const doc = new Document({
  creator: 'Equipo Tienda Virtual CR',
  title: 'Documento Técnico Tienda Virtual CR',
  description: 'Documento técnico completo del sistema Tienda Virtual CR v2.0',
  styles: {
    default: { document: { run: { font: 'Arial', size: 24 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: '1F3864' },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: '2E75B6' },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: '2E75B6' },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•',
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.',
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '1F3864', space: 1 } },
          children: [new TextRun({ text: 'Tienda Virtual CR · Documento Técnico v2.0',
            size: 18, color: '595959', font: 'Arial', italics: true })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: '1F3864', space: 1 } },
          children: [
            new TextRun({ text: '© 2026 Equipo Tienda Virtual CR · Programación V',
              size: 18, color: '595959', font: 'Arial' }),
            new TextRun({ text: '\tPágina ', size: 18, color: '595959', font: 'Arial' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '595959', font: 'Arial' }),
            new TextRun({ text: ' de ', size: 18, color: '595959', font: 'Arial' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '595959', font: 'Arial' }),
          ],
        })],
      }),
    },
    children: [
      ...portada,
      ...controlVer,
      ...indice,
      ...sec1,
      ...sec2,
      ...sec3,
      ...sec4,
      ...sec5,
      ...sec6,
      ...sec7,
      ...sec7sql,
      ...sec8,
      ...sec9,
      ...sec10,
    ],
  }],
});

const out = path.join(__dirname, '..', 'DOCUMENTO_TECNICO.docx');
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(out, buffer);
  console.log('Documento técnico generado en:', out, '(' + buffer.length + ' bytes)');
});
