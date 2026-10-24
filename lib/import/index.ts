export type RawImportedRow = Record<string, unknown>;

export const IMPORT_SOURCE_TYPES = ["csv", "excel", "manual"] as const;
