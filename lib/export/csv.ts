export type CsvValue = string | number | boolean | Date | null | undefined;

export type CsvColumn<Row> = {
  key: keyof Row;
  header: string;
};

export type CsvRow = Record<string, CsvValue>;

export type CsvDataset = {
  columns: CsvColumn<CsvRow>[];
  rows: CsvRow[];
};

export function buildCsv<Row extends Record<string, CsvValue>>({
  columns,
  rows,
}: {
  columns: CsvColumn<Row>[];
  rows: Row[];
}) {
  const headerLine = columns.map((column) => escapeCsvCell(column.header)).join(",");
  const rowLines = rows.map((row) =>
    columns.map((column) => escapeCsvCell(row[column.key])).join(","),
  );

  return [headerLine, ...rowLines].join("\r\n");
}

function escapeCsvCell(value: CsvValue) {
  if (value === null || value === undefined) {
    return "\"\"";
  }

  const rawValue = value instanceof Date ? value.toISOString() : String(value);
  const normalizedValue = rawValue.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // Spreadsheet-facing text must not be interpreted as a formula. Preserve
  // actual numbers (including negatives) as numbers for downstream analysis.
  const safeValue =
    typeof value === "string" && /^[\s\u0000-\u001f]*[=+\-@＝＋－＠]/u.test(normalizedValue)
      ? `\t${normalizedValue}`
      : normalizedValue;

  return `"${safeValue.replace(/"/g, "\"\"")}"`;
}

export function withUtf8Bom(csv: string) {
  return `\uFEFF${csv}`;
}
