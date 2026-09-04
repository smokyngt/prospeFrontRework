// Generates the second static document used by the marketing demo's
// multi-tab document panel:
//   node scripts/build-demo-annexe-pdf.mjs public/assets/demo/annexe-c-contrats-sous-traitance.pdf
// The PDF is a plain Helvetica/WinAnsi text document, so react-pdf produces a
// real text layer and the viewer's fuzzy citation-text matching can find and
// highlight the cited passages.
import { writeFileSync } from 'node:fs';

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_X = 64;
const TOP_Y = 726;

const WIN_ANSI = {
  'à': '\\340', 'â': '\\342', 'ç': '\\347', 'è': '\\350', 'é': '\\351',
  'ê': '\\352', 'ë': '\\353', 'î': '\\356', 'ï': '\\357', 'ô': '\\364',
  'ù': '\\371', 'û': '\\373', 'ü': '\\374', '€': '\\200', '«': '\\253',
  '»': '\\273', '’': '\\222', '‘': '\\221', '“': '\\223', '”': '\\224',
  '–': '\\226', '—': '\\227', '°': '\\260',
  'À': '\\300', 'Â': '\\302', 'Ç': '\\307', 'È': '\\310', 'É': '\\311',
  'Ê': '\\312', 'Î': '\\316', 'Ô': '\\324', 'Û': '\\333',
};

function escape(text) {
  return text
    .replace(/([\\()])/g, '\\$1')
    .replace(/[^\x00-\x7F]/g, (c) => WIN_ANSI[c] ?? '?');
}

function contentStream(lines) {
  const parts = [];
  let y = TOP_Y;
  for (const line of lines) {
    const size = line.size ?? 10.5;
    y -= (line.spaceBefore ?? 0) + size * 1.62;
    if (line.text.length > 0) {
      parts.push(
        'BT',
        `/${line.bold ? 'FB' : 'FR'} ${size} Tf`,
        `1 0 0 1 ${MARGIN_X} ${y.toFixed(2)} Tm`,
        `(${escape(line.text)}) Tj`,
        'ET',
      );
    }
  }
  return parts.join('\n');
}

function build(pages) {
  const objects = [];
  const pageIds = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[3] =
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  objects[4] =
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

  let next = 5;
  for (const page of pages) {
    const stream = contentStream(page);
    const pageId = next++;
    const contentId = next++;
    pageIds.push(pageId);
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Resources << /Font << /FR 3 0 R /FB 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] =
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }

  objects[2] =
    `<< /Type /Pages /Count ${pageIds.length} ` +
    `/Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`;

  let body = '%PDF-1.4\n';
  const offsets = [];
  for (let id = 1; id < next; id += 1) {
    offsets[id] = body.length;
    body += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = body.length;
  let xref = `xref\n0 ${next}\n0000000000 65535 f \n`;
  for (let id = 1; id < next; id += 1) {
    xref += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  }
  body += `${xref}trailer\n<< /Size ${next} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = Buffer.alloc(body.length);
  for (let i = 0; i < body.length; i += 1) {
    bytes[i] = body.charCodeAt(i) & 0xff;
  }
  return bytes;
}

const H1 = { bold: true, size: 18 };
const H2 = { bold: true, size: 13, spaceBefore: 14 };

const pages = [
  [
    { ...H1, text: "Annexe C - Contrats de sous-traitance logistique" },
    { size: 11, spaceBefore: 4, text: "Projet HELIOS - Groupe Méridien Logistique SAS" },
    { text: '' },
    { ...H2, text: "C.1 Objet de l'annexe" },
    { text: 'La présente annexe recense les contrats de sous-traitance logistique retenus dans' },
    { text: "le pont de normalisation de l'EBITDA 2025 (section Quality of Earnings, p.5 du" },
    { text: 'rapport de due diligence). Elle documente leur durée, leur reconduction et leur' },
    { text: 'caractère récurrent ou ponctuel.' },
    { ...H2, text: 'C.2 Périmètre' },
    { text: "Trois contrats-cadres couvrant l'entreposage, le transport régional et la" },
    { text: "préparation de commandes, pour un montant cumulé de 2,4 M€ sur l'exercice 2025." },
    { text: "Aucun de ces contrats n'a fait l'objet d'une résiliation sur la période examinée." },
  ],
  [
    { ...H1, text: "Annexe C - Contrats de sous-traitance logistique" },
    { size: 11, spaceBefore: 4, text: 'C.3 Détail des contrats' },
    { text: '' },
    { ...H2, text: 'C.3.1 Reconduction' },
    { text: 'Les trois contrats logistiques ont été reconduits sans interruption sur 2023-2025,' },
    { text: "par tacite reconduction annuelle prévue à l'article 4 de chaque contrat-cadre." },
    { text: "Les avenants de 2024 portent uniquement sur l'indexation tarifaire." },
    { ...H2, text: 'C.3.2 Montants par exercice' },
    { text: 'Exercice 2023 : 2,1 M€ - Exercice 2024 : 2,3 M€ - Exercice 2025 : 2,4 M€.' },
    { text: 'La progression suit le volume expédié et non un évènement ponctuel.' },
    { ...H2, text: 'C.3.3 Qualification' },
    { text: 'Le caractère récurrent de ces charges est établi : elles doivent être maintenues' },
    { text: "dans l'EBITDA normalisé, ce qui ramène celui-ci de 14,2 M€ à 11,8 M€." },
  ],
  [
    { ...H1, text: "Annexe C - Contrats de sous-traitance logistique" },
    { size: 11, spaceBefore: 4, text: 'C.4 Conclusion des conseils' },
    { text: '' },
    { ...H2, text: 'C.4.1 Impact sur la valorisation' },
    { text: "À 11,8 M€ d'EBITDA normalisé, le multiple de 8,0x retenu par le vendeur conduit à" },
    { text: "une valeur d'entreprise de 94,4 M€, soit un écart de 19,2 M€ avec la synthèse." },
    { ...H2, text: 'C.4.2 Recommandation' },
    { text: "Le comité d'investissement doit statuer sur la qualification du retraitement de" },
    { text: "2,4 M€ avant toute remise d'offre ferme." },
  ],
];

const out = process.argv[2];
writeFileSync(out, build(pages));
console.log('wrote', out, build(pages).length, 'bytes');
