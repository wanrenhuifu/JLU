import { useState } from "react";
import { tableSchemas } from "@/data/oracle-schema";
import {
  Table,
  Key,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  Link,
  CheckCircle2,
} from "lucide-react";

export default function SchemaCard() {
  const [expandedTable, setExpandedTable] = useState<string | null>("T_USER");

  return (
    <section id="schema" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: "#0f172a" }}>
            数据库表结构
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: "#64748B" }}>
            Oracle 图书管理系统的四张核心数据表及其约束关系
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-12">
          {tableSchemas.map((schema) => {
            const isExpanded = expandedTable === schema.tableName;
            return (
              <div
                key={schema.tableName}
                className="rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:border-purple-500/20"
                style={{ backgroundColor: "#ffffff" }}
              >
                <button
                  onClick={() => setExpandedTable(isExpanded ? null : schema.tableName)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "rgba(192,132,252,0.1)" }}
                    >
                      <Table size={18} style={{ color: "#C084FC" }} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold font-mono" style={{ color: "#0f172a" }}>
                        {schema.tableName}
                      </h3>
                      <p className="text-xs" style={{ color: "#64748B" }}>
                        {schema.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {schema.trigger && (
                      <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border"
                        style={{
                          borderColor: "rgba(251,191,36,0.3)",
                          color: "#FBBF24",
                          backgroundColor: "rgba(251,191,36,0.05)",
                        }}
                      >
                        <Zap size={10} />
                        TRIGGER
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={16} style={{ color: "#64748B" }} />
                    ) : (
                      <ChevronDown size={16} style={{ color: "#64748B" }} />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-200">
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Key size={14} style={{ color: "#C084FC" }} />
                        <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "#C084FC" }}>
                          字段定义
                        </span>
                      </div>
                      <div className="space-y-2">
                        {schema.columns.map((col) => (
                          <div
                            key={col.name}
                            className="flex items-center gap-3 p-2.5 rounded-lg"
                            style={{
                              backgroundColor: col.isPrimary
                                ? "rgba(192,132,252,0.05)"
                                : "rgba(0,0,0,0.02)",
                              borderLeft: col.isPrimary ? "2px solid #C084FC" : "2px solid transparent",
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className="font-mono text-sm font-medium"
                                  style={{ color: col.isPrimary ? "#C084FC" : "#0f172a" }}
                                >
                                  {col.name}
                                </span>
                                {col.isPrimary && (
                                  <span
                                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono"
                                    style={{
                                      backgroundColor: "rgba(192,132,252,0.1)",
                                      color: "#C084FC",
                                    }}
                                  >
                                    <Key size={8} />
                                    PK
                                  </span>
                                )}
                                {!col.nullable && (
                                  <span
                                    className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                                    style={{
                                      backgroundColor: "rgba(248,113,113,0.1)",
                                      color: "#F87171",
                                    }}
                                  >
                                    NOT NULL
                                  </span>
                                )}
                              </div>
                              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                                {col.desc}
                              </p>
                            </div>
                            <span
                              className="font-mono text-xs flex-shrink-0 px-2 py-1 rounded"
                              style={{
                                backgroundColor: "rgba(34,211,238,0.05)",
                                color: "#22D3EE",
                              }}
                            >
                              {col.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield size={14} style={{ color: "#22D3EE" }} />
                        <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "#22D3EE" }}>
                          约束条件
                        </span>
                      </div>
                      <div className="space-y-2">
                        {schema.constraints.map((constraint) => (
                          <div
                            key={constraint.name}
                            className="flex items-start gap-3 p-2.5 rounded-lg"
                            style={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                          >
                            <div
                              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{
                                backgroundColor:
                                  constraint.type === "PRIMARY KEY"
                                    ? "rgba(192,132,252,0.1)"
                                    : constraint.type === "FOREIGN KEY"
                                      ? "rgba(34,211,238,0.1)"
                                      : "rgba(251,191,36,0.1)",
                              }}
                            >
                              {constraint.type === "PRIMARY KEY" ? (
                                <Key size={10} style={{ color: "#C084FC" }} />
                              ) : constraint.type === "FOREIGN KEY" ? (
                                <Link size={10} style={{ color: "#22D3EE" }} />
                              ) : (
                                <CheckCircle2 size={10} style={{ color: "#FBBF24" }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs" style={{ color: "#475569" }}>
                                  {constraint.name}
                                </span>
                                <span
                                  className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                                  style={{
                                    backgroundColor:
                                      constraint.type === "PRIMARY KEY"
                                        ? "rgba(192,132,252,0.1)"
                                        : constraint.type === "FOREIGN KEY"
                                          ? "rgba(34,211,238,0.1)"
                                          : "rgba(251,191,36,0.1)",
                                    color:
                                      constraint.type === "PRIMARY KEY"
                                        ? "#C084FC"
                                        : constraint.type === "FOREIGN KEY"
                                          ? "#22D3EE"
                                          : "#FBBF24",
                                  }}
                                >
                                  {constraint.type}
                                </span>
                              </div>
                              <p className="text-xs mt-0.5 font-mono" style={{ color: "#64748B" }}>
                                {constraint.column}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="rounded-xl border border-slate-200 p-6"
          style={{ backgroundColor: "#ffffff" }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: "#0f172a" }}>
            实体关系图 (ER Diagram)
          </h3>
          <div className="overflow-x-auto">
            <svg viewBox="0 0 700 420" className="w-full max-w-3xl mx-auto">
              <defs>
                <linearGradient id="gradUser" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#C084FC", stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: "#C084FC", stopOpacity: 0.05 }} />
                </linearGradient>
                <linearGradient id="gradType" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#22D3EE", stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: "#22D3EE", stopOpacity: 0.05 }} />
                </linearGradient>
                <linearGradient id="gradBook" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#F472B6", stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: "#F472B6", stopOpacity: 0.05 }} />
                </linearGradient>
                <linearGradient id="gradBorrow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#FBBF24", stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: "#FBBF24", stopOpacity: 0.05 }} />
                </linearGradient>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#64748B" />
                </marker>
              </defs>

              <line x1="170" y1="100" x2="300" y2="180" stroke="#64748B" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrowhead)" />
              <line x1="530" y1="100" x2="400" y2="180" stroke="#64748B" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrowhead)" />
              <line x1="170" y1="300" x2="280" y2="260" stroke="#64748B" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrowhead)" />

              <text x="210" y="130" fill="#64748B" fontSize="10" fontFamily="monospace">USERID</text>
              <text x="440" y="130" fill="#64748B" fontSize="10" fontFamily="monospace">BOOKTYPEID</text>
              <text x="190" y="250" fill="#64748B" fontSize="10" fontFamily="monospace">BOOKID</text>

              <rect x="50" y="50" width="140" height="100" rx="10" fill="url(#gradUser)" stroke="#C084FC" strokeWidth="1.5" />
              <text x="120" y="75" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="600" fontFamily="monospace">T_USER</text>
              <text x="120" y="95" textAnchor="middle" fill="#C084FC" fontSize="9" fontFamily="monospace">USERID (PK)</text>
              <text x="120" y="110" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">USERNAME</text>
              <text x="120" y="125" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">ISADMIN</text>

              <rect x="510" y="50" width="140" height="100" rx="10" fill="url(#gradType)" stroke="#22D3EE" strokeWidth="1.5" />
              <text x="580" y="75" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="600" fontFamily="monospace">T_BOOK_TYPE</text>
              <text x="580" y="95" textAnchor="middle" fill="#22D3EE" fontSize="9" fontFamily="monospace">BOOKTYPEID (PK)</text>
              <text x="580" y="110" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">BOOKTYPENAME</text>
              <text x="580" y="125" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">BOOKTYPEDESC</text>

              <rect x="280" y="160" width="160" height="120" rx="10" fill="url(#gradBook)" stroke="#F472B6" strokeWidth="1.5" />
              <text x="360" y="185" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="600" fontFamily="monospace">T_BOOK_INFO</text>
              <text x="360" y="205" textAnchor="middle" fill="#F472B6" fontSize="9" fontFamily="monospace">BOOKID (PK)</text>
              <text x="360" y="220" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">BOOKNAME | AUTHOR</text>
              <text x="360" y="235" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">BOOKTYPEID (FK)</text>
              <text x="360" y="250" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">BOOKPRICE | ISBORROWED</text>

              <rect x="50" y="290" width="140" height="100" rx="10" fill="url(#gradBorrow)" stroke="#FBBF24" strokeWidth="1.5" />
              <text x="120" y="315" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="600" fontFamily="monospace">T_BORROW</text>
              <text x="120" y="335" textAnchor="middle" fill="#FBBF24" fontSize="9" fontFamily="monospace">BORROWID (PK)</text>
              <text x="120" y="350" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">BOOKID (FK) | USERID (FK)</text>
              <text x="120" y="365" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">BORROWDATE | RETURNDATE</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
