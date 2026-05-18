import { useState } from "react";
import { oracleFeatures } from "@/data/oracle-schema";
import { useAudit } from "@/contexts/AuditContext";
import {
  Database,
  Table,
  Users,
  KeyRound,
  Link,
  Search,
  Eye,
  Zap,
  Code2,
  FileImage,
  Copy,
  Check,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Database,
  Table,
  Users,
  KeyRound,
  Link,
  Search,
  Eye,
  Zap,
  Code2,
  FileImage,
};

export default function OracleFeatures() {
  const [activeTab, setActiveTab] = useState("tables");
  const [copied, setCopied] = useState(false);
  const { addEntry } = useAudit();

  const feature = oracleFeatures.find((f) => f.id === activeTab);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    const feat = oracleFeatures.find((f) => f.id === id);
    if (feat) {
      addEntry({
        operation: `查看 Oracle 特性: ${feat.title}`,
        sql: `-- ${feat.title}\n${feat.codeExample.slice(0, 120)}...`,
        type: "DDL",
        tableName: "DBA_OBJECTS",
        duration: Math.floor(Math.random() * 10) + 5,
        rowsAffected: 1,
      });
    }
  };

  const handleCopy = () => {
    if (feature?.codeExample) {
      navigator.clipboard.writeText(feature.codeExample);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="features" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: "#0f172a" }}>
            Oracle 数据库特性
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: "#64748B" }}>
            深入了解 Oracle 11g 在图书管理系统中的核心特性应用
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div
              className="rounded-xl border border-slate-200 p-2 space-y-1 overflow-x-auto lg:overflow-visible"
              style={{ backgroundColor: "#ffffff" }}
            >
              {oracleFeatures.map((f) => {
                const Icon = iconMap[f.icon] || Database;
                const isActive = activeTab === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => handleTabChange(f.id)}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm transition-all duration-200 whitespace-nowrap"
                    style={{
                      backgroundColor: isActive ? "rgba(192,132,252,0.1)" : "transparent",
                      color: isActive ? "#C084FC" : "#64748B",
                      borderLeft: isActive ? "2px solid #C084FC" : "2px solid transparent",
                    }}
                  >
                    <Icon size={16} />
                    <span className="font-medium">{f.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {feature && (
              <div
                className="rounded-xl border border-slate-200 overflow-hidden"
                style={{ backgroundColor: "#ffffff" }}
              >
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    {(() => {
                      const Icon = iconMap[feature.icon] || Database;
                      return (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: "rgba(192,132,252,0.1)" }}
                        >
                          <Icon size={20} style={{ color: "#C084FC" }} />
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="text-xl font-semibold" style={{ color: "#0f172a" }}>
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
                    {feature.description}
                  </p>
                </div>

                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs font-mono uppercase tracking-wider"
                      style={{ color: "#C084FC" }}
                    >
                      SQL 示例
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-all hover:bg-slate-100"
                      style={{ color: "#64748B" }}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? "已复制" : "复制"}
                    </button>
                  </div>
                  <pre
                    className="rounded-lg p-4 overflow-x-auto text-xs sm:text-sm leading-relaxed"
                    style={{
                      backgroundColor: "#f8fafc",
                      color: "#0f172a",
                      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    }}
                  >
                    <code>{feature.codeExample}</code>
                  </pre>
                </div>

                <div className="p-6">
                  <span
                    className="text-xs font-mono uppercase tracking-wider mb-4 block"
                    style={{ color: "#22D3EE" }}
                  >
                    关键要点
                  </span>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {feature.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg border border-slate-200"
                        style={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{
                            backgroundColor:
                              idx % 3 === 0 ? "#C084FC" : idx % 3 === 1 ? "#22D3EE" : "#F472B6",
                          }}
                        />
                        <span className="text-sm" style={{ color: "#475569" }}>
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
