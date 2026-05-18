import { Activity, Cpu, HardDrive, Zap, ArrowRight, BookOpen, LayoutDashboard } from "lucide-react";
import { useEffect, useState, lazy, Suspense } from "react";

const OracleWave = lazy(() => import("./OracleWave"));

interface HeroSectionProps {
  onNavigate?: (page: string) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  const [metrics, setMetrics] = useState({
    hitRatio: 98.6,
    sessions: 24,
    tablespace: 76.2,
    transactions: 1458,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        hitRatio: Math.min(99.9, prev.hitRatio + (Math.random() - 0.5) * 0.3),
        sessions: Math.max(10, Math.min(50, prev.sessions + Math.floor((Math.random() - 0.5) * 3))),
        tablespace: Math.min(100, Math.max(0, prev.tablespace + (Math.random() - 0.5) * 0.5)),
        transactions: prev.transactions + Math.floor(Math.random() * 5),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="relative w-full overflow-hidden" style={{ height: "70vh", minHeight: "500px" }}>
      <Suspense fallback={<div className="absolute inset-0" style={{ backgroundColor: "#f8fafc" }} />}>
        <OracleWave />
      </Suspense>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 mb-6">
            <Zap size={14} style={{ color: "#C084FC" }} />
            <span className="text-xs font-mono tracking-wider" style={{ color: "#C084FC" }}>
              ORACLE 11g / SPRINGBOOT
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            style={{ color: "#0f172a" }}
          >
            Oracle{" "}
            <span style={{ color: "#C084FC" }}>图书管理系统</span>
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6" style={{ color: "#64748B" }}>
            基于 Oracle 数据库的企业级图书管理解决方案
            <br className="hidden sm:block" />
            体验表空间、触发器、存储过程等完整 Oracle 特性
          </p>

          {/* CTA 按钮 */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate?.("dashboard")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all border"
              style={{
                backgroundColor: "rgba(192,132,252,0.15)",
                borderColor: "rgba(192,132,252,0.3)",
                color: "#C084FC",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(192,132,252,0.25)";
                e.currentTarget.style.borderColor = "rgba(192,132,252,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(192,132,252,0.15)";
                e.currentTarget.style.borderColor = "rgba(192,132,252,0.3)";
              }}
            >
              <LayoutDashboard size={16} />
              进入控制台
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onNavigate?.("books")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all border"
              style={{
                backgroundColor: "rgba(34,211,238,0.08)",
                borderColor: "rgba(34,211,238,0.2)",
                color: "#22D3EE",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(34,211,238,0.15)";
                e.currentTarget.style.borderColor = "rgba(34,211,238,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(34,211,238,0.08)";
                e.currentTarget.style.borderColor = "rgba(34,211,238,0.2)";
              }}
            >
              <BookOpen size={16} />
              浏览图书
            </button>
          </div>
        </div>

        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-3xl rounded-xl p-4 border border-slate-200"
          style={{ backgroundColor: "#ffffff", backdropFilter: "blur(16px)" }}
        >
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Activity size={18} style={{ color: "#22D3EE" }} />
            <div>
              <div className="text-xs font-mono" style={{ color: "#64748B" }}>
                Buffer Hit Ratio
              </div>
              <div className="text-lg font-mono font-semibold" style={{ color: "#22D3EE" }}>
                {metrics.hitRatio.toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Cpu size={18} style={{ color: "#C084FC" }} />
            <div>
              <div className="text-xs font-mono" style={{ color: "#64748B" }}>
                Active Sessions
              </div>
              <div className="text-lg font-mono font-semibold" style={{ color: "#C084FC" }}>
                {metrics.sessions}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <HardDrive size={18} style={{ color: "#F472B6" }} />
            <div>
              <div className="text-xs font-mono" style={{ color: "#64748B" }}>
                Tablespace Used
              </div>
              <div className="text-lg font-mono font-semibold" style={{ color: "#F472B6" }}>
                {metrics.tablespace.toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Zap size={18} style={{ color: "#FBBF24" }} />
            <div>
              <div className="text-xs font-mono" style={{ color: "#64748B" }}>
                Transactions
              </div>
              <div className="text-lg font-mono font-semibold" style={{ color: "#FBBF24" }}>
                {metrics.transactions.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
