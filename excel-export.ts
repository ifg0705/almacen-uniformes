import { FAMILY_LABEL, ROLE_LABEL, kitFor, type Gender, type Role } from "./catalog";
import type { FullBackup } from "./inventory-api";

type CellValue = string | number | boolean | null | undefined;
type SheetSpec = {
  name: string;
  headers: string[];
  rows: CellValue[][];
  widths?: number[];
};

const encoder = new TextEncoder();

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function columnName(index: number) {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

function cellXml(value: CellValue, row: number, col: number, style = 0) {
  const ref = `${columnName(col)}${row}`;
  const styleAttr = style ? ` s="${style}"` : "";
  if (value === null || value === undefined || value === "") {
    return `<c r="${ref}"${styleAttr} t="inlineStr"><is><t></t></is></c>`;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${ref}"${styleAttr}><v>${value}</v></c>`;
  }
  if (typeof value === "boolean") {
    return `<c r="${ref}"${styleAttr} t="b"><v>${value ? 1 : 0}</v></c>`;
  }
  return `<c r="${ref}"${styleAttr} t="inlineStr"><is><t xml:space="preserve">${xmlEscape(String(value))}</t></is></c>`;
}

function sheetXml(sheet: SheetSpec) {
  const allRows = [sheet.headers, ...sheet.rows];
  const lastCol = columnName(Math.max(0, sheet.headers.length - 1));
  const lastRow = Math.max(1, allRows.length);
  const widths = sheet.widths ?? sheet.headers.map((h) => Math.min(42, Math.max(12, h.length + 3)));
  const cols = widths
    .map((width, i) => `<col min="${i + 1}" max="${i + 1}" width="${width}" customWidth="1"/>`)
    .join("");
  const rows = allRows
    .map((values, r) => {
      const rowNum = r + 1;
      const cells = values.map((value, c) => cellXml(value, rowNum, c, r === 0 ? 1 : 0)).join("");
      return `<row r="${rowNum}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${lastCol}${lastRow}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <cols>${cols}</cols>
  <sheetData>${rows}</sheetData>
  <autoFilter ref="A1:${lastCol}${lastRow}"/>
</worksheet>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Aptos"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF343A40"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function workbookXml(sheets: SheetSpec[]) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${sheets
    .map((sheet, i) => `<sheet name="${xmlEscape(sheet.name.slice(0, 31))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`)
    .join("")}</sheets>
</workbook>`;
}

function workbookRelsXml(sheets: SheetSpec[]) {
  const rels = sheets
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${rels}
  <Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function contentTypesXml(sheets: SheetSpec[]) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${sheets
    .map(
      (_, i) =>
        `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    )
    .join("")}
</Types>`;
}

const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value: number) {
  return [value & 0xff, (value >>> 8) & 0xff];
}

function u32(value: number) {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
}

function concat(chunks: Uint8Array[]) {
  const length = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function zipStore(files: Array<{ name: string; text: string }>) {
  const localChunks: Uint8Array[] = [];
  const centralChunks: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = encoder.encode(file.text);
    const crc = crc32(data);
    const local = new Uint8Array([
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(name.length),
      ...u16(0),
      ...name,
    ]);
    localChunks.push(local, data);

    const central = new Uint8Array([
      ...u32(0x02014b50),
      ...u16(20),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(name.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(offset),
      ...name,
    ]);
    centralChunks.push(central);
    offset += local.length + data.length;
  }

  const localData = concat(localChunks);
  const centralData = concat(centralChunks);
  const end = new Uint8Array([
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(files.length),
    ...u16(files.length),
    ...u32(centralData.length),
    ...u32(localData.length),
    ...u16(0),
  ]);
  return concat([localData, centralData, end]);
}

function niceRole(role: Role) {
  return ROLE_LABEL[role] ?? role;
}

function niceGender(gender: Gender) {
  return gender === "mujer" ? "Mujer" : "Hombre";
}

function makeSheets(data: FullBackup): SheetSpec[] {
  const totalUnits = data.items.reduce((sum, i) => sum + i.stock, 0);
  const totalValue = data.items.reduce((sum, i) => sum + i.stock * i.unitCost, 0);

  const summary: SheetSpec = {
    name: "Resumen",
    headers: ["Concepto", "Valor"],
    widths: [34, 26],
    rows: [
      ["Respaldo generado", new Date().toLocaleString("es-MX")],
      ["Origen", data.persistent ? "Neon / Vercel" : "Base temporal"],
      ["Productos / tallas", data.items.length],
      ["Piezas en almacén", totalUnits],
      ["Valor estimado del inventario", Number(totalValue.toFixed(2))],
      ["Entregas registradas", data.deliveries.length],
      ["Movimientos registrados", data.movements.length],
    ],
  };

  const inventory: SheetSpec = {
    name: "Inventario",
    headers: ["ID", "Producto", "Familia", "Talla", "Stock", "Stock mínimo", "Costo unitario", "Valor"],
    widths: [14, 48, 28, 12, 12, 14, 16, 16],
    rows: data.items.map((i) => [
      i.id,
      i.description,
      FAMILY_LABEL[i.family] ?? i.family,
      i.size,
      i.stock,
      i.minStock,
      i.unitCost,
      Number((i.stock * i.unitCost).toFixed(2)),
    ]),
  };

  const deliveries: SheetSpec = {
    name: "Entregas",
    headers: ["ID entrega", "Fecha", "Colaborador", "Área", "Puesto", "Sexo", "Total piezas"],
    widths: [24, 14, 32, 26, 28, 12, 14],
    rows: data.deliveries.map((d) => [
      d.id,
      d.date,
      d.name,
      d.area,
      niceRole(d.role),
      niceGender(d.gender),
      d.lines.reduce((sum, line) => sum + line.qty, 0),
    ]),
  };

  const deliveryDetail: SheetSpec = {
    name: "Detalle entregas",
    headers: ["ID entrega", "Fecha", "Colaborador", "Área", "Puesto", "Sexo", "ID producto", "Producto", "Talla", "Cantidad"],
    widths: [24, 14, 30, 24, 28, 12, 14, 46, 12, 12],
    rows: data.deliveries.flatMap((d) =>
      d.lines.map((line) => [
        d.id,
        d.date,
        d.name,
        d.area,
        niceRole(d.role),
        niceGender(d.gender),
        line.itemId,
        line.description,
        line.size,
        line.qty,
      ]),
    ),
  };

  const movements: SheetSpec = {
    name: "Movimientos",
    headers: ["ID", "Fecha", "Tipo", "ID producto", "Producto", "Cambio", "Referencia", "Proveedor", "Nota", "Creado"],
    widths: [24, 14, 14, 14, 46, 12, 26, 24, 38, 24],
    rows: data.movements.map((m) => [
      m.id,
      m.date,
      m.type,
      m.itemId,
      m.description,
      m.qtyChange,
      m.reference,
      m.supplier,
      m.note,
      m.createdAt,
    ]),
  };

  const kitCards: Array<{ title: string; role: Role; gender: Gender }> = [
    { title: "Operador", role: "operador", gender: "hombre" },
    { title: "Operadora", role: "operador", gender: "mujer" },
    { title: "Supervisor", role: "supervisor", gender: "hombre" },
    { title: "Supervisora", role: "supervisor", gender: "mujer" },
    { title: "Supervisor de mantenimiento", role: "mantenimiento", gender: "hombre" },
    { title: "Operador de caseta", role: "caseta", gender: "hombre" },
  ];
  const kits: SheetSpec = {
    name: "Kits",
    headers: ["Kit", "Prenda", "Cantidad", "Familia de inventario"],
    widths: [32, 38, 12, 30],
    rows: kitCards.flatMap((card) =>
      kitFor(card.role, card.gender).map((piece) => [
        card.title,
        piece.label,
        piece.qty,
        FAMILY_LABEL[piece.family] ?? piece.family,
      ]),
    ),
  };

  return [summary, inventory, deliveries, deliveryDetail, movements, kits];
}

export function createBackupXlsxBlob(data: FullBackup) {
  const sheets = makeSheets(data);
  const files: Array<{ name: string; text: string }> = [
    { name: "[Content_Types].xml", text: contentTypesXml(sheets) },
    { name: "_rels/.rels", text: rootRelsXml },
    { name: "xl/workbook.xml", text: workbookXml(sheets) },
    { name: "xl/_rels/workbook.xml.rels", text: workbookRelsXml(sheets) },
    { name: "xl/styles.xml", text: stylesXml() },
    ...sheets.map((sheet, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, text: sheetXml(sheet) })),
  ];

  const bytes = zipStore(files);
  return new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function downloadBackupXlsx(data: FullBackup) {
  const blob = createBackupXlsxBlob(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `Respaldo_Uniformes_Cesantoni_${today}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
