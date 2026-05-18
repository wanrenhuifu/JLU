import { useState, useEffect } from "react";
import { Activity, Cpu, HardDrive, Zap, Clock, Database, Server, FileText } from "lucide-react";

interface Metric { label: string; value: string | number; unit: string; icon: typeof Activity; color: string; source: string; }

export default function OracleMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "Buffer Cache Hit", value: 98.6, unit: "%", icon: Activity, color: "#C084FC", source: "v$sysstat" },
    { label: "Library Cache Hit", value: 99.2, unit: "%", icon: Database, color: "#22D3EE", source: "v$librarycache" },
    { label: "Redo Log Buffer", value: 12, unit: "MB", icon: FileText, color: "#F472B6", source: "v$sysstat" },
    { label: "Active Sessions", value: 24, unit: "", icon: Cpu, color: "#FBBF24", source: "v$session" },
    { label: "Tablespace Used", value: 76.2, unit: "%", icon: HardDrive, color: "#4ADE80", source: "dba_free_space" },
    { label: "Transactions/sec", value: 1458, unit: "tps", icon: Zap, color: "#FB923C", source: "v$sysstat" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => {
          let newVal: string | number = m.value;
          if (m.label === "Buffer Cache Hit") newVal = Math.min(99.9, Math.max(95, (m.value as number) + (Math.random() - 0.5) * 0.4));
          else if (m.label === "Library Cache Hit") newVal = Math.min(99.9, Math.max(97, (m.value as number) + (Math.random() - 0.5) * 0.2));
          else if (m.label === "Redo Log Buffer") newVal = Math.max(0, Math.round((m.value as number) + (Math.random() - 0.5) * 3));
          else if (m.label === "Active Sessions") newVal = Math.max(10, Math.min(50, (m.value as number) + Math.floor((Math.random() - 0.5) * 3)));
          else if (m.label === "Tablespace Used") newVal = Math.min(100, Math.max(0, (m.value as number) + (Math.random() - 0.5) * 0.3));
          else if (m.label === "Transactions/sec") newVal = Math.max(1000, (m.value as number) + Math.floor((Math.random() - 0.5) * 15));
          return { ...m, value: newVal };
        })
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 p-5" style={{ backgroundColor: "#ffffff" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server size={14} style={{ color: "#C084FC" }} />
          <h3 className="text-sm font-semibold" style={{ color: "#0f172a" }}>Oracle 实时性能指标</h3>
        </div>
        <span className="text-xs font-mono" style={{ color: "#64748B" }}>
          <Clock size={10} className="inline mr-1" />
          v$SYSSTAT / DBA_*
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="p-3 rounded-lg border border-slate-200" style={{ backgroundColor: "#f1f5f9" }}>
            <div className="flex items-center gap-2 mb-1.5">
              <m.icon size={12} style={{ color: m.color }} />
              <span className="text-[10px] font-mono" style={{ color: "#64748B" }}>{m.source}</span>
            </div>
            <div className="text-lg font-bold font-mono" style={{ color: m.color }}>
              {typeof m.value === "number" ? m.value.toFixed(m.label.includes("Hit") || m.label.includes("Used") ? 1 : 0) : m.value}
              <span className="text-xs ml-0.5" style={{ color: "#64748B" }}>{m.unit}</span>
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
