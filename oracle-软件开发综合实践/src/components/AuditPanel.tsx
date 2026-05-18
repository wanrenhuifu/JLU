import { useAudit } from "@/contexts/AuditContext";
import { Terminal, X, Trash2, ChevronRight, Clock, Database, Play } from "lucide-react";

const typeColors: Record<string, string> = {
  SELECT: "#22D3EE",
  INSERT: "#4ADE80",
  UPDATE: "#FBBF24",
  DELETE: "#F87171",
  DDL: "#C084FC",
  PLSQL: "#F472B6",
  TRIGGER: "#A78BFA",
  TRANSACTION: "#34D399",
};

export default function AuditPanel() {
  const { entries, clearEntries, isPanelOpen, setIsPanelOpen } = useAudit();

  if (!isPanelOpen) return null;

  return (
    <div
      className="fixed right-0 top-16 bottom-0 w-full sm:w-[520px] border-l border-slate-200 z-40 flex flex-col overflow-hidden"
      style={{ backgroundColor: "#ffffff", backdropFilter: "blur(20px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={16} style={{ color: "#C084FC" }} />
          <h3 className="text-sm font-semibold" style={{ color: "#0f172a" }}>Oracle SQL 审计日志</h3>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono" style={{ backgroundColor: "rgba(192,132,252,0.1)", color: "#C084FC" }}>
            {entries.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearEntries}
            className="p-1.5 rounded-md transition-colors hover:bg-slate-100"
            style={{ color: "#64748B" }}
            title="清空"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setIsPanelOpen(false)}
            className="p-1.5 rounded-md transition-colors hover:bg-slate-100"
            style={{ color: "#64748B" }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <Database size={32} style={{ color: "#cbd5e1" }} className="mb-3" />
            <p className="text-sm" style={{ color: "#64748B" }}>暂无 SQL 操作记录</p>
            <p className="text-xs mt-1" style={{ color: "#64748B" }}>执行任意操作后将在此显示对应的 Oracle SQL 语句</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {entries.map((entry) => (
              <div key={entry.id} className="px-4 py-3 hover:bg-black/[0.02] transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                    style={{
                      backgroundColor: `${typeColors[entry.type]}15`,
                      color: typeColors[entry.type],
                    }}
                  >
                    {entry.type}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: "#64748B" }}>
                    <Clock size={8} className="inline mr-0.5" />
                    {entry.timestamp}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: "#64748B" }}>
                    {entry.duration}ms
                  </span>
                  {entry.rowsAffected > 0 && (
                    <span className="text-[10px] font-mono" style={{ color: "#4ADE80" }}>
                      {entry.rowsAffected} rows
                    </span>
                  )}
                  <ChevronRight size={10} className="ml-auto" style={{ color: "#cbd5e1" }} />
                </div>
                <div className="text-xs mb-1" style={{ color: "#475569" }}>{entry.operation}</div>
                <pre
                  className="text-[11px] p-2 rounded-lg overflow-x-auto"
                  style={{
                    backgroundColor: "#f8fafc",
                    color: "#0f172a",
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  }}
                >
                  <code>{entry.sql}</code>
                </pre>
                {entry.plan && (
                  <div className="mt-1.5 p-2 rounded border border-slate-200" style={{ backgroundColor: "rgba(34,211,238,0.03)" }}>
                    <div className="text-[10px] mb-1 font-mono" style={{ color: "#22D3EE" }}>
                      <Play size={8} className="inline mr-1" />
                      EXECUTION PLAN
                    </div>
                    <pre className="text-[10px]" style={{ color: "#64748B", fontFamily: '"JetBrains Mono", monospace' }}>
                      {entry.plan}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
