import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface AuditEntry {
  id: number;
  timestamp: string;
  operation: string;
  sql: string;
  type: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "DDL" | "PLSQL" | "TRIGGER" | "TRANSACTION";
  tableName: string;
  duration: number; // ms
  rowsAffected: number;
  plan?: string; // execution plan
  success?: boolean;
}

interface AuditContextType {
  entries: AuditEntry[];
  addEntry: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;
  clearEntries: () => void;
  lastEntry: AuditEntry | null;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
}

let nextId = 1;

const AuditContext = createContext<AuditContextType | null>(null);

export function AuditProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [lastEntry, setLastEntry] = useState<AuditEntry | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const addEntry = useCallback((entry: Omit<AuditEntry, "id" | "timestamp">) => {
    const fullEntry: AuditEntry = {
      ...entry,
      id: nextId++,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
    };
    setEntries((prev) => [fullEntry, ...prev].slice(0, 200));
    setLastEntry(fullEntry);
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
    setLastEntry(null);
  }, []);

  return (
    <AuditContext.Provider value={{ entries, addEntry, clearEntries, lastEntry, isPanelOpen, setIsPanelOpen }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error("useAudit must be used within AuditProvider");
  return ctx;
}

// Helper: generate Oracle SQL for common operations
export function generateSelectSQL(tableName: string, columns: string[], where?: string, orderBy?: string): string {
  let sql = `SELECT ${columns.join(", ")} FROM "SYSTEM"."${tableName}"`;
  if (where) sql += ` WHERE ${where}`;
  if (orderBy) sql += ` ORDER BY ${orderBy}`;
  return sql;
}

export function generateInsertSQL(tableName: string, columns: string[], values: (string | number)[]): string {
  const valStr = values.map((v) => (typeof v === "string" ? `'${v}'` : v)).join(", ");
  return `INSERT INTO "SYSTEM"."${tableName}" (${columns.join(", ")}) VALUES (${valStr})`;
}

export function generateUpdateSQL(tableName: string, setClause: string, where: string): string {
  return `UPDATE "SYSTEM"."${tableName}" SET ${setClause} WHERE ${where}`;
}

export function generateDeleteSQL(tableName: string, where: string): string {
  return `DELETE FROM "SYSTEM"."${tableName}" WHERE ${where}`;
}

export function generateTriggerSQL(triggerName: string, tableName: string, seqName: string, colName: string): string {
  return `CREATE TRIGGER "${triggerName}"\n  BEFORE INSERT ON "${tableName}"\n  FOR EACH ROW\nBEGIN\n  SELECT ${seqName}.NEXTVAL INTO :NEW.${colName} FROM DUAL;\nEND;`;
}

export function generateProcedureCall(procName: string, params: string[]): string {
  return `BEGIN\n  ${procName}(${params.join(", ")});\n  COMMIT;\nEND;`;
}

export function generateSequenceSQL(seqName: string, tableName: string): string {
  return `CREATE SEQUENCE ${seqName}\n  START WITH (SELECT NVL(MAX(${tableName}_ID), 0) + 1 FROM "${tableName}")\n  INCREMENT BY 1\n  NOCACHE\n  NOCYCLE;`;
}
