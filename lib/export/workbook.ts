import type { CsvDataset, CsvRow, CsvValue } from "@/lib/export/csv";
import {
  AUDIT_CSV_EXPORT_DEFINITIONS,
  getAuditXlsxReportDefinition,
  FULL_AUDIT_WORKBOOK_DEFINITION,
  type AuditCsvExportType,
} from "@/lib/export/definitions";
import {
  buildAuditExportDatasets,
  buildExportFileName,
  type AuditExportDatasetResult,
} from "@/lib/export/builders";

const SHEET_DEFINITIONS: Array<{
  name: string;
  exportType: AuditCsvExportType;
  emptyMessage: string;
}> = [
  {
    name: "Summary",
    exportType: "AUDIT_SUMMARY",
    emptyMessage: "No audit summary is available for this audit.",
  },
  {
    name: "Sections",
    exportType: "SECTION_SCORES",
    emptyMessage: "No audit sections are available for this audit.",
  },
  {
    name: "Findings",
    exportType: "FINDINGS",
    emptyMessage: "No findings are available for this audit.",
  },
  {
    name: "Recommendations",
    exportType: "RECOMMENDATIONS",
    emptyMessage: "No recommendations are available for this audit.",
  },
  {
    name: "Experiments",
    exportType: "EXPERIMENTS",
    emptyMessage: "No experiments are available for this audit.",
  },
];

const AUDIT_METADATA_KEYS = new Set(["auditId", "auditTitle", "brandName"]);
const METADATA_ROW_COUNT = 5;
const TABLE_HEADER_ROW = METADATA_ROW_COUNT + 2;

const STYLE = {
  default: 0,
  title: 1,
  sectionHeader: 2,
  metadataLabel: 3,
  metadataValue: 4,
  tableHeader: 5,
  bodyCentered: 6,
  bodyWrapped: 7,
  numberCentered: 8,
  emptyState: 9,
  positive: 10,
  warning: 11,
  danger: 12,
  neutral: 13,
} as const;

type WorkbookAuditMetadata = {
  id: string;
  title: string;
  brandName: string;
  auditDate: Date;
};

type WorkbookSheet = {
  name: string;
  exportType: AuditCsvExportType;
  dataset: CsvDataset;
  emptyMessage: string;
};

type WorkbookFile = {
  path: string;
  data: string | Buffer;
};

type WorksheetCell = {
  value: CsvValue;
  style: number;
  numeric?: boolean;
};

export type FullAuditWorkbookExportResult = {
  buffer: Buffer;
  fileName: string;
  rowCounts: Record<AuditCsvExportType, number>;
};

export type IndividualAuditWorkbookExportResult = {
  buffer: Buffer;
  fileName: string;
  rowCount: number;
  exportType: AuditCsvExportType;
};

export async function buildFullAuditWorkbookExport({
  auditId,
}: {
  auditId: string;
}): Promise<FullAuditWorkbookExportResult | null> {
  const exportData = await buildAuditExportDatasets(auditId);

  if (!exportData) {
    return null;
  }

  const sheets = SHEET_DEFINITIONS.map((sheet) => ({
    name: sheet.name,
    exportType: sheet.exportType,
    dataset: exportData.datasets[sheet.exportType],
    emptyMessage: sheet.emptyMessage,
  }));
  const rowCounts = buildRowCounts(exportData);

  return {
    buffer: createXlsxWorkbook(sheets, exportData.audit),
    fileName: buildExportFileName({
      exportSlug: FULL_AUDIT_WORKBOOK_DEFINITION.slug,
      auditTitle: exportData.audit.title,
      auditId: exportData.audit.id,
      extension: "xlsx",
    }),
    rowCounts,
  };
}

export async function buildIndividualAuditWorkbookExport({
  auditId,
  exportType,
}: {
  auditId: string;
  exportType: AuditCsvExportType;
}): Promise<IndividualAuditWorkbookExportResult | null> {
  const exportData = await buildAuditExportDatasets(auditId);

  if (!exportData) {
    return null;
  }

  const sheetDefinition = SHEET_DEFINITIONS.find((sheet) => sheet.exportType === exportType);
  const reportDefinition = getAuditXlsxReportDefinition(exportType);

  if (!sheetDefinition || !reportDefinition) {
    return null;
  }

  const sheet = {
    name: sheetDefinition.name,
    exportType: sheetDefinition.exportType,
    dataset: exportData.datasets[sheetDefinition.exportType],
    emptyMessage: sheetDefinition.emptyMessage,
  };

  return {
    buffer: createXlsxWorkbook([sheet], exportData.audit),
    fileName: buildExportFileName({
      exportSlug: reportDefinition.slug,
      auditTitle: exportData.audit.title,
      auditId: exportData.audit.id,
      extension: "xlsx",
    }),
    rowCount: sheet.dataset.rows.length,
    exportType,
  };
}

function buildRowCounts(exportData: AuditExportDatasetResult) {
  return AUDIT_CSV_EXPORT_DEFINITIONS.reduce(
    (rowCounts, definition) => {
      rowCounts[definition.type] = exportData.datasets[definition.type].rows.length;
      return rowCounts;
    },
    {} as Record<AuditCsvExportType, number>,
  );
}

function createXlsxWorkbook(sheets: WorkbookSheet[], audit: WorkbookAuditMetadata) {
  const files: WorkbookFile[] = [
    {
      path: "[Content_Types].xml",
      data: buildContentTypesXml(sheets),
    },
    {
      path: "_rels/.rels",
      data: buildRootRelationshipsXml(),
    },
    {
      path: "docProps/core.xml",
      data: buildCorePropertiesXml(),
    },
    {
      path: "docProps/app.xml",
      data: buildAppPropertiesXml(sheets),
    },
    {
      path: "xl/workbook.xml",
      data: buildWorkbookXml(sheets),
    },
    {
      path: "xl/_rels/workbook.xml.rels",
      data: buildWorkbookRelationshipsXml(sheets),
    },
    {
      path: "xl/styles.xml",
      data: buildStylesXml(),
    },
    ...sheets.map((sheet, index) => ({
      path: `xl/worksheets/sheet${index + 1}.xml`,
      data: buildWorksheetXml(sheet, audit),
    })),
  ];

  return createZip(files);
}

function buildContentTypesXml(sheets: WorkbookSheet[]) {
  const sheetOverrides = sheets
    .map(
      (_sheet, index) =>
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    )
    .join("");

  return xmlDocument(`\
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\
<Default Extension="xml" ContentType="application/xml"/>\
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>\
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>\
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>\
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>\
${sheetOverrides}\
</Types>`);
}

function buildRootRelationshipsXml() {
  return xmlDocument(`\
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>\
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>\
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>\
</Relationships>`);
}

function buildCorePropertiesXml() {
  const now = new Date().toISOString();

  return xmlDocument(`\
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\
<dc:creator>PMCAS</dc:creator>\
<cp:lastModifiedBy>PMCAS</cp:lastModifiedBy>\
<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>\
<dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>\
</cp:coreProperties>`);
}

function buildAppPropertiesXml(sheets: WorkbookSheet[]) {
  const sheetNames = sheets.map((sheet) => `<vt:lpstr>${escapeXml(sheet.name)}</vt:lpstr>`).join("");

  return xmlDocument(`\
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">\
<Application>PMCAS</Application>\
<DocSecurity>0</DocSecurity>\
<ScaleCrop>false</ScaleCrop>\
<HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>${sheets.length}</vt:i4></vt:variant></vt:vector></HeadingPairs>\
<TitlesOfParts><vt:vector size="${sheets.length}" baseType="lpstr">${sheetNames}</vt:vector></TitlesOfParts>\
</Properties>`);
}

function buildWorkbookXml(sheets: WorkbookSheet[]) {
  const sheetEntries = sheets
    .map(
      (sheet, index) =>
        `<sheet name="${escapeXmlAttribute(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`,
    )
    .join("");

  return xmlDocument(`\
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\
<bookViews><workbookView xWindow="120" yWindow="120" windowWidth="22000" windowHeight="14000"/></bookViews>\
<sheets>${sheetEntries}</sheets>\
</workbook>`);
}

function buildWorkbookRelationshipsXml(sheets: WorkbookSheet[]) {
  const worksheetRelationships = sheets
    .map(
      (_sheet, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
    )
    .join("");
  const styleRelationshipId = sheets.length + 1;

  return xmlDocument(`\
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\
${worksheetRelationships}\
<Relationship Id="rId${styleRelationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\
</Relationships>`);
}

function buildStylesXml() {
  return xmlDocument(`\
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\
<fonts count="4">\
<font><sz val="11"/><name val="Calibri"/></font>\
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>\
<font><b/><sz val="16"/><color rgb="FF0F172A"/><name val="Calibri"/></font>\
<font><b/><sz val="11"/><color rgb="FF0F172A"/><name val="Calibri"/></font>\
</fonts>\
<fills count="9">\
<fill><patternFill patternType="none"/></fill>\
<fill><patternFill patternType="gray125"/></fill>\
<fill><patternFill patternType="solid"><fgColor rgb="FF0F172A"/><bgColor indexed="64"/></patternFill></fill>\
<fill><patternFill patternType="solid"><fgColor rgb="FFE0F2FE"/><bgColor indexed="64"/></patternFill></fill>\
<fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>\
<fill><patternFill patternType="solid"><fgColor rgb="FFDCFCE7"/><bgColor indexed="64"/></patternFill></fill>\
<fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/><bgColor indexed="64"/></patternFill></fill>\
<fill><patternFill patternType="solid"><fgColor rgb="FFFEE2E2"/><bgColor indexed="64"/></patternFill></fill>\
<fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/><bgColor indexed="64"/></patternFill></fill>\
</fills>\
<borders count="2">\
<border><left/><right/><top/><bottom/><diagonal/></border>\
<border><left style="medium"><color rgb="FF666666"/></left><right style="medium"><color rgb="FF666666"/></right><top style="medium"><color rgb="FF666666"/></top><bottom style="medium"><color rgb="FF666666"/></bottom><diagonal/></border>\
</borders>\
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>\
<cellXfs count="14">\
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>\
<xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>\
<xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>\
<xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>\
<xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>\
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>\
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>\
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top" wrapText="1"/></xf>\
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>\
<xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top" wrapText="1"/></xf>\
<xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>\
<xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>\
<xf numFmtId="0" fontId="0" fillId="7" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>\
<xf numFmtId="0" fontId="0" fillId="8" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>\
</cellXfs>\
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>\
</styleSheet>`);
}

function buildWorksheetXml(sheet: WorkbookSheet, audit: WorkbookAuditMetadata) {
  if (sheet.exportType === "AUDIT_SUMMARY") {
    return buildSummaryWorksheetXml(sheet, audit);
  }

  return buildTableWorksheetXml(sheet, audit);
}

function buildSummaryWorksheetXml(sheet: WorkbookSheet, audit: WorkbookAuditMetadata) {
  const summaryRow = sheet.dataset.rows[0] ?? {};
  const rows: string[] = [];
  const mergeRefs: string[] = [];
  let rowNumber = 1;

  addMergedRow(rows, mergeRefs, rowNumber, "PMCAS Audit Summary", STYLE.title, "A", "D", 28);
  rowNumber += 2;
  addMergedRow(rows, mergeRefs, rowNumber, "Audit Information", STYLE.sectionHeader, "A", "D", 22);
  rowNumber += 1;
  rowNumber = addKeyValueRow(rows, mergeRefs, rowNumber, "Audit ID", audit.id);
  rowNumber = addKeyValueRow(rows, mergeRefs, rowNumber, "Audit Title", audit.title);
  rowNumber = addKeyValueRow(rows, mergeRefs, rowNumber, "Brand Name", audit.brandName);
  rowNumber = addKeyValueRow(rows, mergeRefs, rowNumber, "Audit Date", formatReadableDate(audit.auditDate));
  rowNumber += 1;

  addMergedRow(rows, mergeRefs, rowNumber, "Key Metrics", STYLE.sectionHeader, "A", "D", 22);
  rowNumber += 1;
  rowNumber = addKeyValueRow(rows, mergeRefs, rowNumber, "Overall Score", summaryRow.overallScore);
  rowNumber = addKeyValueRow(rows, mergeRefs, rowNumber, "Overall Confidence", summaryRow.overallConfidence);
  rowNumber = addKeyValueRow(rows, mergeRefs, rowNumber, "Scaling Readiness", summaryRow.scalingReadiness);
  rowNumber = addKeyValueRow(rows, mergeRefs, rowNumber, "Completion Percentage", summaryRow.completionPercentage);
  rowNumber = addKeyValueRow(rows, mergeRefs, rowNumber, "Total Findings", summaryRow.totalFindings);
  rowNumber = addKeyValueRow(rows, mergeRefs, rowNumber, "Total Recommendations", summaryRow.totalRecommendations);
  rowNumber = addKeyValueRow(rows, mergeRefs, rowNumber, "Total Experiments", summaryRow.totalExperiments);
  rowNumber += 1;

  addMergedRow(rows, mergeRefs, rowNumber, "Highest-Risk Sections", STYLE.sectionHeader, "A", "D", 22);
  rowNumber += 1;
  const highestRiskItems = formatHighestRiskSections(summaryRow.highestRiskSections);
  if (highestRiskItems.length > 0) {
    highestRiskItems.forEach((item) => {
      addMergedRow(rows, mergeRefs, rowNumber, `- ${item}`, STYLE.bodyWrapped, "A", "D", 26);
      rowNumber += 1;
    });
  } else {
    addMergedRow(rows, mergeRefs, rowNumber, "No highest-risk sections available.", STYLE.emptyState, "A", "D", 24);
    rowNumber += 1;
  }
  rowNumber += 1;

  addMergedRow(rows, mergeRefs, rowNumber, "Executive Summary", STYLE.sectionHeader, "A", "D", 22);
  rowNumber += 1;
  addMergedRow(
    rows,
    mergeRefs,
    rowNumber,
    normalizeCellValue(summaryRow.summary) || "No executive summary captured yet.",
    STYLE.bodyWrapped,
    "A",
    "D",
    84,
  );

  return xmlDocument(`\
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft"/></sheetView></sheetViews>\
<sheetFormatPr defaultRowHeight="20"/>\
<cols><col min="1" max="1" width="28" customWidth="1"/><col min="2" max="2" width="34" customWidth="1"/><col min="3" max="3" width="34" customWidth="1"/><col min="4" max="4" width="34" customWidth="1"/></cols>\
<sheetData>${rows.join("")}</sheetData>\
${buildMergeCellsXml(mergeRefs)}\
<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>\
</worksheet>`);
}

function buildTableWorksheetXml(sheet: WorkbookSheet, audit: WorkbookAuditMetadata) {
  const dataset = removeAuditMetadataColumns(sheet.dataset);
  const rows = dataset.rows.length > 0 ? dataset.rows : [buildEmptyRow(dataset, sheet.emptyMessage)];
  const lastColumn = getColumnName(dataset.columns.length);
  const lastRow = TABLE_HEADER_ROW + rows.length;
  const ref = `A${TABLE_HEADER_ROW}:${lastColumn}${lastRow}`;
  const mergeRefs: string[] = [];
  const metadataRows = buildMetadataRowsXml(audit, mergeRefs);

  return xmlDocument(`\
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\
<sheetViews><sheetView workbookViewId="0"><pane ySplit="${TABLE_HEADER_ROW}" topLeftCell="A${TABLE_HEADER_ROW + 1}" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft"/></sheetView></sheetViews>\
<sheetFormatPr defaultRowHeight="20"/>\
${buildColumnsXml(dataset)}\
<sheetData>${metadataRows}<row r="6"/><row r="${TABLE_HEADER_ROW}" ht="22" customHeight="1">${buildHeaderCellsXml(dataset.columns, TABLE_HEADER_ROW)}</row>${rows.map((row, index) => buildDataRowXml(row, dataset.columns, TABLE_HEADER_ROW + index + 1, dataset.rows.length === 0)).join("")}</sheetData>\
${buildMergeCellsXml(mergeRefs)}\
<autoFilter ref="${ref}"/>\
<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>\
</worksheet>`);
}

function buildMetadataRowsXml(audit: WorkbookAuditMetadata, mergeRefs: string[]) {
  const rows: string[] = [];

  addMergedRow(rows, mergeRefs, 1, "PMCAS Audit Export", STYLE.title, "A", "D", 26);
  addMetadataRow(rows, mergeRefs, 2, "Audit ID", audit.id);
  addMetadataRow(rows, mergeRefs, 3, "Audit Title", audit.title);
  addMetadataRow(rows, mergeRefs, 4, "Brand Name", audit.brandName);
  addMetadataRow(rows, mergeRefs, 5, "Audit Date", formatReadableDate(audit.auditDate));

  return rows.join("");
}

function addMetadataRow(
  rows: string[],
  mergeRefs: string[],
  rowNumber: number,
  label: string,
  value: CsvValue,
) {
  rows.push(
    buildRowXml(
      [
        { value: label, style: STYLE.metadataLabel },
        { value: value ?? "", style: STYLE.metadataValue },
      ],
      rowNumber,
    ),
  );
  mergeRefs.push(`B${rowNumber}:D${rowNumber}`);
}

function addKeyValueRow(
  rows: string[],
  mergeRefs: string[],
  rowNumber: number,
  label: string,
  value: CsvValue,
) {
  addMetadataRow(rows, mergeRefs, rowNumber, label, formatSummaryValue(label, value));

  return rowNumber + 1;
}

function addMergedRow(
  rows: string[],
  mergeRefs: string[],
  rowNumber: number,
  value: CsvValue,
  style: number,
  startColumn: string,
  endColumn: string,
  height?: number,
) {
  rows.push(
    buildRowXml(
      [
        {
          value,
          style,
        },
      ],
      rowNumber,
      height,
    ),
  );
  mergeRefs.push(`${startColumn}${rowNumber}:${endColumn}${rowNumber}`);
}

function buildColumnsXml(dataset: CsvDataset) {
  const columns = dataset.columns
    .map((column, index) => {
      const width = getColumnWidth(column.header, column.key, dataset.rows);

      return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`;
    })
    .join("");

  return `<cols>${columns}</cols>`;
}

function buildHeaderCellsXml(columns: CsvDataset["columns"], rowNumber: number) {
  return columns
    .map((column, index) => {
      const cellRef = `${getColumnName(index + 1)}${rowNumber}`;

      return buildStringCell(cellRef, column.header, STYLE.tableHeader);
    })
    .join("");
}

function buildDataRowXml(
  row: CsvRow,
  columns: CsvDataset["columns"],
  rowNumber: number,
  isEmptyStateRow: boolean,
) {
  const cells = columns.map((column, index) => {
    const value = formatWorkbookCellValue(column.header, row[column.key]);
    const cellRef = `${getColumnName(index + 1)}${rowNumber}`;
    const style = getDataCellStyle(column.header, value, isEmptyStateRow);

    if (typeof value === "number" && Number.isFinite(value) && !isSemanticColumn(column.header)) {
      return buildNumberCell(cellRef, value, style);
    }

    return buildStringCell(cellRef, normalizeCellValue(value), style);
  });

  return `<row r="${rowNumber}">${cells.join("")}</row>`;
}

function buildRowXml(cells: WorksheetCell[], rowNumber: number, height?: number) {
  const heightAttrs = height ? ` ht="${height}" customHeight="1"` : "";
  const cellXml = cells
    .map((cell, index) => {
      const cellRef = `${getColumnName(index + 1)}${rowNumber}`;

      if (cell.numeric && typeof cell.value === "number" && Number.isFinite(cell.value)) {
        return buildNumberCell(cellRef, cell.value, cell.style);
      }

      return buildStringCell(cellRef, normalizeCellValue(cell.value), cell.style);
    })
    .join("");

  return `<row r="${rowNumber}"${heightAttrs}>${cellXml}</row>`;
}

function buildMergeCellsXml(mergeRefs: string[]) {
  if (mergeRefs.length === 0) {
    return "";
  }

  return `<mergeCells count="${mergeRefs.length}">${mergeRefs.map((ref) => `<mergeCell ref="${ref}"/>`).join("")}</mergeCells>`;
}

function removeAuditMetadataColumns(dataset: CsvDataset): CsvDataset {
  const columns = dataset.columns.filter((column) => !AUDIT_METADATA_KEYS.has(String(column.key)));

  return {
    columns,
    rows: dataset.rows,
  };
}

function buildEmptyRow(dataset: CsvDataset, emptyMessage: string): CsvRow {
  const row: CsvRow = {};
  const firstColumn = dataset.columns[0];

  if (firstColumn) {
    row[firstColumn.key] = emptyMessage;
  }

  return row;
}

function getDataCellStyle(header: string, value: CsvValue, isEmptyStateRow: boolean) {
  if (isEmptyStateRow) {
    return STYLE.emptyState;
  }

  const normalizedHeader = header.toLowerCase();
  const normalizedValue = normalizeCellValue(value).toLowerCase();

  if (normalizedHeader.includes("risk") || normalizedHeader.includes("severity")) {
    if (normalizedValue.includes("critical")) return STYLE.danger;
    if (normalizedValue.includes("risk") || normalizedValue.includes("high")) return STYLE.warning;
    if (normalizedValue.includes("needs") || normalizedValue.includes("medium")) return STYLE.warning;
    if (normalizedValue.includes("strong") || normalizedValue.includes("low")) return STYLE.positive;
  }

  if (normalizedHeader.includes("priority")) {
    if (normalizedValue.includes("critical")) return STYLE.danger;
    if (normalizedValue.includes("high")) return STYLE.warning;
    if (normalizedValue.includes("medium")) return STYLE.warning;
    if (normalizedValue.includes("low")) return STYLE.neutral;
  }

  if (normalizedHeader.includes("confidence")) {
    if (normalizedValue.includes("high")) return STYLE.positive;
    if (normalizedValue.includes("medium")) return STYLE.warning;
    if (normalizedValue.includes("low")) return STYLE.neutral;
  }

  if (normalizedHeader.includes("status")) {
    if (
      normalizedValue.includes("accepted") ||
      normalizedValue.includes("completed") ||
      normalizedValue.includes("running")
    ) {
      return STYLE.positive;
    }
    if (normalizedValue.includes("dismissed") || normalizedValue.includes("rejected")) {
      return STYLE.danger;
    }
    if (normalizedValue.includes("progress") || normalizedValue.includes("planned")) {
      return STYLE.warning;
    }
    if (
      normalizedValue.includes("draft") ||
      normalizedValue.includes("backlog") ||
      normalizedValue.includes("paused")
    ) {
      return STYLE.neutral;
    }
  }

  if (isLongTextColumn(header)) {
    return STYLE.bodyWrapped;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return STYLE.numberCentered;
  }

  return STYLE.bodyCentered;
}

function isSemanticColumn(header: string) {
  const normalizedHeader = header.toLowerCase();

  return (
    normalizedHeader.includes("risk") ||
    normalizedHeader.includes("severity") ||
    normalizedHeader.includes("priority") ||
    normalizedHeader.includes("confidence") ||
    normalizedHeader.includes("status")
  );
}

function isLongTextColumn(header: string) {
  const normalizedHeader = header.toLowerCase();

  return (
    normalizedHeader.includes("description") ||
    normalizedHeader.includes("evidence") ||
    normalizedHeader.includes("business impact") ||
    normalizedHeader.includes("related finding") ||
    normalizedHeader.includes("related recommendation") ||
    normalizedHeader.includes("recommendation title") ||
    normalizedHeader.includes("rationale") ||
    normalizedHeader.includes("expected impact") ||
    normalizedHeader.includes("problem") ||
    normalizedHeader.includes("hypothesis") ||
    normalizedHeader.includes("proposed") ||
    normalizedHeader.includes("result") ||
    normalizedHeader.includes("learning") ||
    normalizedHeader.includes("next action") ||
    normalizedHeader.includes("summary") ||
    normalizedHeader.includes("highest-risk")
  );
}

function getColumnWidth(header: string, key: keyof CsvRow, rows: CsvRow[]) {
  const normalized = `${String(key)} ${header}`.toLowerCase();
  const sampleLength = rows
    .slice(0, 20)
    .reduce((max, row) => Math.max(max, normalizeCellValue(row[key]).length), header.length);
  const headerWidth = header.length + 4;

  if (isLongTextColumn(header)) {
    return Math.max(headerWidth, 44);
  }

  if (normalized.includes("title") || normalized.includes("metric")) {
    return Math.max(headerWidth, 32);
  }

  if (normalized.includes("date") || normalized.includes("deadline")) {
    return Math.max(headerWidth, 26);
  }

  if (
    normalized.includes("score") ||
    normalized.includes("count") ||
    normalized.includes("weight") ||
    normalized.includes("effort") ||
    normalized.includes("impact") ||
    normalized.includes("ease")
  ) {
    return Math.max(headerWidth, 18);
  }

  if (
    normalized.includes("status") ||
    normalized.includes("risk") ||
    normalized.includes("confidence") ||
    normalized.includes("severity") ||
    normalized.includes("priority") ||
    normalized.includes("owner")
  ) {
    return Math.max(headerWidth, 24);
  }

  return Math.min(Math.max(sampleLength + 2, headerWidth, 16), 36);
}

function formatWorkbookCellValue(header: string, value: CsvValue): CsvValue {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (isDateTimeColumn(header)) {
    return formatReadableDateTime(value);
  }

  if (isDateOnlyColumn(header)) {
    return formatReadableDate(value);
  }

  if (typeof value === "string") {
    return formatAcronyms(value);
  }

  return value;
}

function formatSummaryValue(label: string, value: CsvValue): CsvValue {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (label === "Audit Date") {
    return formatReadableDate(value);
  }

  return typeof value === "string" ? formatAcronyms(value) : value;
}

function isDateOnlyColumn(header: string) {
  return header === "Audit Date" || header === "Deadline";
}

function isDateTimeColumn(header: string) {
  return header === "Created Date" || header === "Updated Date";
}

function formatReadableDate(value: CsvValue) {
  const dateParts = getDateParts(value);

  if (!dateParts) {
    return "";
  }

  return `${dateParts.monthName} ${dateParts.day}${getOrdinalSuffix(dateParts.day)} ${dateParts.year}`;
}

function formatReadableDateTime(value: CsvValue) {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  const datePart = formatReadableDate(date);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const hour12 = hours % 12 || 12;
  const suffix = hours >= 12 ? "PM" : "AM";

  return `${datePart}, ${hour12}:${minutes.toString().padStart(2, "0")} ${suffix}`;
}

function getDateParts(value: CsvValue) {
  if (value instanceof Date) {
    return {
      monthName: getMonthName(value.getMonth()),
      day: value.getDate(),
      year: value.getFullYear(),
    };
  }

  if (typeof value === "string") {
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnlyMatch) {
      const monthIndex = Number(dateOnlyMatch[2]) - 1;

      return {
        monthName: getMonthName(monthIndex),
        day: Number(dateOnlyMatch[3]),
        year: Number(dateOnlyMatch[1]),
      };
    }
  }

  const date = parseDate(value);

  if (!date) {
    return null;
  }

  return {
    monthName: getMonthName(date.getMonth()),
    day: date.getDate(),
    year: date.getFullYear(),
  };
}

function parseDate(value: CsvValue) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getMonthName(monthIndex: number) {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][monthIndex] ?? "";
}

function getOrdinalSuffix(day: number) {
  const mod100 = day % 100;

  if (mod100 >= 11 && mod100 <= 13) {
    return "th";
  }

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatHighestRiskSections(value: CsvValue) {
  return normalizeCellValue(value)
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => formatAcronyms(item.replace(/\(([^)]+)\)/, "- $1")));
}

function formatAcronyms(value: string) {
  return value.replace(/\bCrm\b/g, "CRM").replace(/\bCro\b/g, "CRO").replace(/\bPpc\b/g, "PPC");
}

function buildStringCell(cellRef: string, value: string, styleIndex: number) {
  return `<c r="${cellRef}" s="${styleIndex}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function buildNumberCell(cellRef: string, value: number, styleIndex: number) {
  return `<c r="${cellRef}" s="${styleIndex}"><v>${value}</v></c>`;
}

function normalizeCellValue(value: CsvValue) {
  if (value === null || value === undefined) {
    return "";
  }

  return value instanceof Date ? value.toISOString() : String(value);
}

function getColumnName(index: number) {
  let columnName = "";
  let current = index;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    columnName = String.fromCharCode(65 + remainder) + columnName;
    current = Math.floor((current - 1) / 26);
  }

  return columnName;
}

function xmlDocument(body: string) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${body}`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeXmlAttribute(value: string) {
  return escapeXml(value).replace(/"/g, "&quot;");
}

function createZip(files: WorkbookFile[]) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  const now = new Date();
  const modTime = getDosTime(now);
  const modDate = getDosDate(now);
  let offset = 0;

  for (const file of files) {
    const fileName = Buffer.from(file.path, "utf8");
    const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, "utf8");
    const crc = crc32(data);
    const localHeader = Buffer.alloc(30);

    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(modTime, 10);
    localHeader.writeUInt16LE(modDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(fileName.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, fileName, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(modTime, 12);
    centralHeader.writeUInt16LE(modDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(fileName.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, fileName);

    offset += localHeader.length + fileName.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const centralDirectoryOffset = offset;
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(files.length, 8);
  endRecord.writeUInt16LE(files.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(centralDirectoryOffset, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, endRecord]);
}

function getDosTime(date: Date) {
  return (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
}

function getDosDate(date: Date) {
  const year = Math.max(date.getFullYear(), 1980);

  return ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
}

const CRC_TABLE = new Uint32Array(256).map((_value, index) => {
  let current = index;

  for (let bit = 0; bit < 8; bit += 1) {
    current = current & 1 ? 0xedb88320 ^ (current >>> 1) : current >>> 1;
  }

  return current >>> 0;
});

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}
