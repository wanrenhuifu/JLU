import { useEffect, useState } from "react";
import { useAudit } from "@/contexts/AuditContext";
import { Terminal, CheckCircle2, Database } from "lucide-react";

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

export default function SQLToast() {
  const { lastEntry } = useAudit();
  const [show, setShow] = useState(false);
  const [entry, setEntry] = useState(lastEntry);

  useEffect(() => {
    if (lastEntry) {
      setEntry(lastEntry);
      setShow(true);
      const timer = setTimeout(() => setShow(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [lastEntry]);

  if (!show || !entry) return null;

  const color = typeColors[entry.type] || "#C084FC";

  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-md w-[90vw] sm:w-auto"
      style={{ animation: "slideUpFade 0.3s ease-out" }}
    >
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        className="rounded-xl border p-4 shadow-2xl"
        style={{
          backgroundColor: "#ffffff",
          borderColor: `${color}30`,
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={14} style={{ color: "#4ADE80" }} />
          <span className="text-xs font-medium" style={{ color: "#4ADE80" }}>Oracle SQL 执行成功</span>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-mono ml-auto"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {entry.type}
          </span>
        </div>
        <div className="text-xs mb-1.5" style={{ color: "#475569" }}>{entry.operation}</div>
        <pre
          className="text-[11px] p-2 rounded-lg overflow-x-auto"
          style={{
            backgroundColor: "#f8fafc",
            color: "#0f172a",
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            borderLeft: `2px solid ${color}40`,
          }}
        >
          <code className="whitespace-pre-wrap break-all">{entry.sql}</code>
        </pre>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] font-mono" style={{ color: "#64748B" }}>
            <Database size={8} className="inline mr-1" />
            SYSTEM@ORCL
          </span>
          <span className="text-[10px] font-mono" style={{ color: "#64748B" }}>{entry.duration}ms</span>
          {entry.rowsAffected > 0 && (
            <span className="text-[10px] font-mono" style={{ color: "#4ADE80" }}>
              {entry.rowsAffected} row{entry.rowsAffected > 1 ? "s" : ""} affected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Floating audit button
export function AuditButton() {
  const { entries, isPanelOpen, setIsPanelOpen } = useAudit();

  return (
    <button
      onClick={() => setIsPanelOpen(!isPanelOpen)}
      className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full border flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105"
      style={{
        backgroundColor: isPanelOpen ? "rgba(192,132,252,0.2)" : "#ffffff",
        borderColor: isPanelOpen ? "rgba(192,132,252,0.4)" : "rgba(0,0,0,0.1)",
        backdropFilter: "blur(12px)",
      }}
      title="SQL审计日志"
    >
      <Terminal size={18} style={{ color: isPanelOpen ? "#C084FC" : "#64748B" }} />
      {entries.length > 0 && (
        <span
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
          style={{ backgroundColor: "#C084FC", color: "#fff" }}
        >
          {entries.length > 99 ? "99+" : entries.length}
        </span>
      )}
    </button>
  );
}
