import { useState, useMemo } from "react";
import { useAudit } from "@/contexts/AuditContext";
import type { Book, UserData, BorrowRecord, BookType } from "@/types";
import {
  Play, Database, AlertCircle, CheckCircle2,
  Clock, Search, Terminal, FileJson,
} from "lucide-react";

interface SQLWorkbenchProps {
  books: Book[];
  users: UserData[];
  borrows: BorrowRecord[];
  bookTypes: BookType[];
}

type SQLResult = {
  success: boolean;
  columns: string[];
  rows: Record<string, string | number>[];
  message: string;
  plan: string;
  duration: number;
};

const tableMap: Record<string, string> = {
  T_BOOK_INFO: "books",
  BOOK_INFO: "books",
  T_USER: "users",
  USER: "users",
  T_BORROW: "borrows",
  BORROW: "borrows",
  T_BOOK_TYPE: "bookTypes",
  BOOK_TYPE: "bookTypes",
};

const presets = [
  { label: "查询所有图书", sql: 'SELECT * FROM "T_BOOK_INFO"' },
  { label: "查询可借阅图书", sql: 'SELECT * FROM "T_BOOK_INFO" WHERE ISBORROWED = 0' },
  { label: "查询所有用户", sql: 'SELECT * FROM "T_USER"' },
  { label: "查询活跃借阅", sql: 'SELECT * FROM "T_BORROW" WHERE STATUS = \'active\'' },
  { label: "查询图书分类", sql: 'SELECT * FROM "T_BOOK_TYPE"' },
  { label: "查询科幻类图书", sql: 'SELECT BOOKNAME, BOOKAUTHOR FROM "T_BOOK_INFO" WHERE BOOKTYPEID = 4' },
];

function parseSimpleSQL(sql: string) {
  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();

  // SELECT
  const selectMatch = upper.match(/^SELECT\s+(.+?)\s+FROM\s+["']?(\w+)["']?\s*(.*)$/i);
  if (selectMatch) {
    const colsPart = selectMatch[1].trim();
    const table = selectMatch[2].trim();
    const rest = selectMatch[3].trim();
    const columns = colsPart === "*" ? [] : colsPart.split(",").map((c) => {
      const trimmed = c.trim().replace(/["']/g, "");
      return trimmed.split(/\s+/).pop() || trimmed;
    });
    const where: Record<string, string | number> = {};
    if (rest.toUpperCase().startsWith("WHERE")) {
      const whereClause = rest.slice(5).trim();
      // 简单解析 col = value
      const wMatch = whereClause.match(/["']?(\w+)["']?\s*=\s*(.+)/);
      if (wMatch) {
        let val = wMatch[2].trim();
        if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
          val = val.slice(1, -1);
        } else {
          const num = Number(val);
          if (!isNaN(num)) val = String(num) as any;
        }
        where[wMatch[1].toUpperCase()] = val;
      }
    }
    return { type: "SELECT" as const, table, columns, where, raw: trimmed };
  }

  // INSERT
  const insertMatch = upper.match(/^INSERT\s+INTO\s+["']?(\w+)["']?\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
  if (insertMatch) {
    const table = insertMatch[1].trim();
    const columns = insertMatch[2].split(",").map((c) => c.trim().replace(/"/g, ""));
    const values = insertMatch[3].split(",").map((v) => {
      v = v.trim();
      if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) return v.slice(1, -1);
      const num = Number(v);
      return isNaN(num) ? v : num;
    });
    return { type: "INSERT" as const, table, columns, values, raw: trimmed };
  }

  // UPDATE
  const updateMatch = upper.match(/^UPDATE\s+["']?(\w+)["']?\s+SET\s+(.+)/i);
  if (updateMatch) {
    const table = updateMatch[1].trim();
    const rest = updateMatch[2].trim();
    const setPart: Record<string, string | number> = {};
    const where: Record<string, string | number> = {};

    const whereIdx = rest.toUpperCase().indexOf(" WHERE ");
    const setStr = whereIdx >= 0 ? rest.slice(0, whereIdx) : rest;
    const whereStr = whereIdx >= 0 ? rest.slice(whereIdx + 7) : "";

    setStr.split(",").forEach((pair) => {
      const eq = pair.indexOf("=");
      if (eq > 0) {
        const k = pair.slice(0, eq).trim().replace(/"/g, "");
        let v = pair.slice(eq + 1).trim();
        if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) v = v.slice(1, -1);
        const num = Number(v);
        setPart[k.toUpperCase()] = isNaN(num) ? v : num;
      }
    });

    if (whereStr) {
      const wMatch = whereStr.match(/["']?(\w+)["']?\s*=\s*(.+)/);
      if (wMatch) {
        let val = wMatch[2].trim();
        if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) val = val.slice(1, -1);
        const num = Number(val);
        where[wMatch[1].toUpperCase()] = isNaN(num) ? val : num;
      }
    }
    return { type: "UPDATE" as const, table, set: setPart, where, raw: trimmed };
  }

  // DELETE
  const deleteMatch = upper.match(/^DELETE\s+FROM\s+["']?(\w+)["']?\s*(.*)/i);
  if (deleteMatch) {
    const table = deleteMatch[1].trim();
    const rest = deleteMatch[2].trim();
    const where: Record<string, string | number> = {};
    if (rest.toUpperCase().startsWith("WHERE")) {
      const whereClause = rest.slice(5).trim();
      const wMatch = whereClause.match(/["']?(\w+)["']?\s*=\s*(.+)/);
      if (wMatch) {
        let val = wMatch[2].trim();
        if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) val = val.slice(1, -1);
        const num = Number(val);
        where[wMatch[1].toUpperCase()] = isNaN(num) ? val : num;
      }
    }
    return { type: "DELETE" as const, table, where, raw: trimmed };
  }

  return null;
}

function executeOnData(
  parsed: NonNullable<ReturnType<typeof parseSimpleSQL>>,
  data: SQLWorkbenchProps
): SQLResult {
  const target = tableMap[parsed.table.toUpperCase()];
  if (!target) {
    return { success: false, columns: [], rows: [], message: `表 "${parsed.table}" 不存在`, plan: "", duration: 0 };
  }

  const start = performance.now();
  let list: Record<string, unknown>[] = [];
  switch (target) {
    case "books": list = data.books as unknown as Record<string, unknown>[]; break;
    case "users": list = data.users as unknown as Record<string, unknown>[]; break;
    case "borrows": list = data.borrows as unknown as Record<string, unknown>[]; break;
    case "bookTypes": list = data.bookTypes as unknown as Record<string, unknown>[]; break;
  }

  const applyWhere = (item: Record<string, unknown>) => {
    return Object.entries(parsed.where || {}).every(([k, v]) => {
      const itemKey = Object.keys(item).find((ik) => ik.toUpperCase() === k.toUpperCase());
      const val = itemKey !== undefined ? item[itemKey] : undefined;
      if (typeof val === "number" && typeof v === "string") return val === Number(v);
      return String(val) === String(v);
    });
  };

  if (parsed.type === "SELECT") {
    const filtered = list.filter(applyWhere);
    const columns = parsed.columns.length > 0
      ? parsed.columns
      : filtered.length > 0 ? Object.keys(filtered[0]) : [];
    const rows = filtered.map((item) => {
      const row: Record<string, string | number> = {};
      columns.forEach((col) => {
        const key = Object.keys(item).find((k) => k.toUpperCase() === col.toUpperCase()) || col;
        const v = item[key];
        row[col] = typeof v === "object" ? JSON.stringify(v) : (v as string | number);
      });
      return row;
    });
    const duration = Math.round(performance.now() - start);
    return {
      success: true,
      columns,
      rows,
      message: `查询成功，返回 ${rows.length} 行`,
      plan: `TABLE ACCESS FULL | ${parsed.table} | Rows: ${list.length} | Cost: ${Math.ceil(list.length / 10)}\n  FILTER: WHERE clause | Rows: ${rows.length}`,
      duration,
    };
  }

  if (parsed.type === "INSERT") {
    const duration = Math.round(performance.now() - start);
    return {
      success: true,
      columns: ["RESULT"],
      rows: [{ RESULT: "1 row inserted (simulated)" }],
      message: "模拟插入成功（实际数据未变更）",
      plan: `TABLE ACCESS BY INDEX ROWID | ${parsed.table}\n  INDEX UNIQUE SCAN | PK | Cost: 2`,
      duration,
    };
  }

  if (parsed.type === "UPDATE") {
    const matched = list.filter(applyWhere);
    const duration = Math.round(performance.now() - start);
    return {
      success: true,
      columns: ["RESULT"],
      rows: [{ RESULT: `${matched.length} row(s) updated (simulated)` }],
      message: `模拟更新成功，影响 ${matched.length} 行（实际数据未变更）`,
      plan: `TABLE ACCESS FULL | ${parsed.table} | Rows: ${list.length}\n  UPDATE | Rows: ${matched.length} | Cost: ${Math.ceil(list.length / 8)}`,
      duration,
    };
  }

  if (parsed.type === "DELETE") {
    const matched = list.filter(applyWhere);
    const duration = Math.round(performance.now() - start);
    return {
      success: true,
      columns: ["RESULT"],
      rows: [{ RESULT: `${matched.length} row(s) deleted (simulated)` }],
      message: `模拟删除成功，影响 ${matched.length} 行（实际数据未变更）`,
      plan: `TABLE ACCESS FULL | ${parsed.table} | Rows: ${list.length}\n  DELETE | Rows: ${matched.length} | Cost: ${Math.ceil(list.length / 8)}`,
      duration,
    };
  }

  return { success: false, columns: [], rows: [], message: "未支持的 SQL 类型", plan: "", duration: 0 };
}

export default function SQLWorkbench({ books, users, borrows, bookTypes }: SQLWorkbenchProps) {
  const [sql, setSql] = useState('SELECT * FROM "T_BOOK_INFO"');
  const [result, setResult] = useState<SQLResult | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [scn] = useState(() => Date.now());
  const { addEntry } = useAudit();

  const allData = useMemo(() => ({ books, users, borrows, bookTypes }), [books, users, borrows, bookTypes]);

  const handleExecute = () => {
    if (!sql.trim()) return;
    const parsed = parseSimpleSQL(sql);
    if (!parsed) {
      setResult({
        success: false,
        columns: [],
        rows: [],
        message: "仅支持简单的 SELECT / INSERT / UPDATE / DELETE 语句",
        plan: "",
        duration: 0,
      });
      addEntry({
        operation: "SQL 语法错误",
        sql: sql,
        type: "SELECT",
        tableName: "UNKNOWN",
        duration: 0,
        rowsAffected: 0,
        plan: "PARSE ERROR",
        success: false,
      });
      return;
    }

    const res = executeOnData(parsed, allData);
    setResult(res);
    setHistory((prev) => [sql, ...prev].slice(0, 20));

    addEntry({
      operation: `SQL 工作台: ${parsed.type} ${parsed.table}`,
      sql: sql,
      type: parsed.type === "SELECT" ? "SELECT" : parsed.type === "INSERT" ? "INSERT" : parsed.type === "UPDATE" ? "UPDATE" : "DELETE",
      tableName: parsed.table,
      duration: res.duration,
      rowsAffected: res.rows.length,
      plan: res.plan,
      success: res.success,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleExecute();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>SQL 工作台</h2>
        <p className="text-xs font-mono mt-0.5" style={{ color: "#64748B" }}>
          <Terminal size={10} className="inline mr-1" />
          模拟 Oracle SQL 执行环境 · 支持 SELECT / INSERT / UPDATE / DELETE
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左侧：输入区 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 快捷语句 */}
          <div className="rounded-xl border border-slate-200 p-3" style={{ backgroundColor: "#ffffff" }}>
            <div className="text-xs font-mono mb-2" style={{ color: "#64748B" }}>快捷语句</div>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setSql(p.sql)}
                  className="px-2.5 py-1.5 rounded-md text-xs border transition-all hover:border-purple-500/30"
                  style={{ backgroundColor: "rgba(192,132,252,0.05)", borderColor: "rgba(0,0,0,0.08)", color: "#475569" }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* SQL 输入 */}
          <div className="rounded-xl border border-slate-200 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200" style={{ backgroundColor: "#f1f5f9" }}>
              <div className="flex items-center gap-2">
                <Database size={12} style={{ color: "#C084FC" }} />
                <span className="text-xs font-mono" style={{ color: "#64748B" }}>SQL EDITOR</span>
              </div>
              <span className="text-[10px] font-mono" style={{ color: "#cbd5e1" }}>Ctrl + Enter 执行</span>
            </div>
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={6}
              className="w-full px-4 py-3 text-sm font-mono outline-none resize-none"
              style={{ backgroundColor: "#f8fafc", color: "#0f172a", lineHeight: 1.6 }}
              spellCheck={false}
            />
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <div className="text-[10px] font-mono" style={{ color: "#cbd5e1" }}>
                SYSTEM@ORCL11g · SCN:{scn}
              </div>
              <button
                onClick={handleExecute}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all border"
                style={{ backgroundColor: "rgba(192,132,252,0.15)", borderColor: "rgba(192,132,252,0.3)", color: "#C084FC" }}
              >
                <Play size={14} />
                执行 SQL
              </button>
            </div>
          </div>

          {/* 执行结果 */}
          {result && (
            <div className="rounded-xl border border-slate-200 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200" style={{ backgroundColor: "#f1f5f9" }}>
                {result.success ? <CheckCircle2 size={12} style={{ color: "#4ADE80" }} /> : <AlertCircle size={12} style={{ color: "#F87171" }} />}
                <span className="text-xs font-mono" style={{ color: result.success ? "#4ADE80" : "#F87171" }}>
                  {result.message}
                </span>
                <span className="text-[10px] font-mono ml-auto" style={{ color: "#64748B" }}>
                  <Clock size={10} className="inline mr-1" />
                  {result.duration} ms
                </span>
              </div>

              {result.rows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: "#f1f5f9" }}>
                        {result.columns.map((col) => (
                          <th key={col} className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-wider" style={{ color: "#64748B" }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, i) => (
                        <tr key={i} className="border-t border-slate-200">
                          {result.columns.map((col) => (
                            <td key={col} className="px-4 py-2 text-xs font-mono" style={{ color: "#475569" }}>
                              {String(row[col] ?? "NULL")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 执行计划 */}
              <div className="px-4 py-3 border-t border-slate-200" style={{ backgroundColor: "#f1f5f9" }}>
                <div className="text-[10px] font-mono mb-1" style={{ color: "#22D3EE" }}>Execution Plan</div>
                <pre className="text-[10px] font-mono" style={{ color: "#64748B" }}>
                  {result.plan || "N/A"}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：历史 + 表信息 */}
        <div className="space-y-4">
          {/* 历史记录 */}
          <div className="rounded-xl border border-slate-200 p-4" style={{ backgroundColor: "#ffffff" }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={12} style={{ color: "#C084FC" }} />
              <span className="text-xs font-semibold" style={{ color: "#0f172a" }}>执行历史</span>
            </div>
            {history.length === 0 ? (
              <p className="text-xs" style={{ color: "#64748B" }}>暂无执行记录</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {history.map((h, i) => (
                  <button
                    key={`${i}-${h.slice(0, 20)}`}
                    onClick={() => setSql(h)}
                    className="w-full text-left px-2.5 py-2 rounded-md text-[10px] font-mono border transition-all hover:border-slate-300 truncate"
                    style={{ backgroundColor: "#f1f5f9", borderColor: "rgba(0,0,0,0.05)", color: "#475569" }}
                    title={h}
                  >
                    {h.length > 40 ? h.slice(0, 40) + "..." : h}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 表结构速查 */}
          <div className="rounded-xl border border-slate-200 p-4" style={{ backgroundColor: "#ffffff" }}>
            <div className="flex items-center gap-2 mb-3">
              <FileJson size={12} style={{ color: "#22D3EE" }} />
              <span className="text-xs font-semibold" style={{ color: "#0f172a" }}>表结构速查</span>
            </div>
            <div className="space-y-3">
              {[
                { name: "T_BOOK_INFO", cols: ["BOOKID", "BOOKNAME", "BOOKAUTHOR", "BOOKPRICE", "BOOKTYPEID", "ISBORROWED"], count: books.length },
                { name: "T_USER", cols: ["USERID", "USERNAME", "USERPASSWORD", "ISADMIN"], count: users.length },
                { name: "T_BORROW", cols: ["BORROWID", "BOOKID", "USERID", "BORROWDATE", "RETURNDATE", "STATUS"], count: borrows.length },
                { name: "T_BOOK_TYPE", cols: ["BOOKTYPEID", "BOOKTYPENAME", "BOOKTYPEDESC"], count: bookTypes.length },
              ].map((t) => (
                <div key={t.name} className="p-2.5 rounded-lg border border-slate-200" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-medium" style={{ color: "#C084FC" }}>{t.name}</span>
                    <span className="text-[10px] font-mono" style={{ color: "#64748B" }}>{t.count} rows</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {t.cols.map((c) => (
                      <span key={c} className="px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ backgroundColor: "rgba(34,211,238,0.05)", color: "#22D3EE" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 提示 */}
          <div className="rounded-xl border border-slate-200 p-4" style={{ backgroundColor: "#ffffff" }}>
            <div className="flex items-center gap-2 mb-2">
              <Search size={12} style={{ color: "#FBBF24" }} />
              <span className="text-xs font-semibold" style={{ color: "#0f172a" }}>支持的语法</span>
            </div>
            <ul className="space-y-1.5 text-[10px] font-mono" style={{ color: "#64748B" }}>
              <li>• SELECT * FROM table</li>
              <li>• SELECT col1, col2 FROM table</li>
              <li>• ... WHERE col = value</li>
              <li>• INSERT INTO table (cols) VALUES (...)</li>
              <li>• UPDATE table SET col = val WHERE ...</li>
              <li>• DELETE FROM table WHERE ...</li>
            </ul>
            <p className="text-[10px] mt-2" style={{ color: "#cbd5e1" }}>
              INSERT/UPDATE/DELETE 仅模拟执行，不修改实际数据
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
