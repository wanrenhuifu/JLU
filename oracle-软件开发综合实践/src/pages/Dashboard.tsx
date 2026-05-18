import { useMemo, useEffect, useRef } from "react";
import { bookTypes, users } from "@/data/books";
import type { Book } from "@/types";
import OracleMetrics from "./OracleMetrics";
import { useAudit, generateSelectSQL } from "@/contexts/AuditContext";
import {
  BookOpen, Users, Layers, ArrowRight, Database, Clock,
  TableProperties, KeyRound, Zap, Search, Eye,
  Code2, FileImage, Shield, TrendingUp,
} from "lucide-react";

interface DashboardProps {
  user: { userName: string; isAdmin: number };
  onNavigate: (page: string) => void;
  borrowRecords: { borrowId: number; bookId: number; bookName: string; userName: string; borrowDate: string; returnDate?: string; status: "active" | "returned" }[];
  books: Book[];
}

export default function Dashboard({ user, onNavigate, borrowRecords, books }: DashboardProps) {
  const { addEntry } = useAudit();

  // 模拟初始查询的SQL审计
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // SELECT COUNT(*) FROM T_BOOK_INFO
    addEntry({
      operation: "查询图书总数 (v$SQL)",
      sql: generateSelectSQL("T_BOOK_INFO", ["COUNT(*) AS total_books"]),
      type: "SELECT",
      tableName: "T_BOOK_INFO",
      duration: 12,
      rowsAffected: 1,
      plan: "TABLE ACCESS FULL | T_BOOK_INFO | 9 rows | Cost: 2",
    });

    addEntry({
      operation: "查询用户信息 (DBA_USERS)",
      sql: generateSelectSQL("T_USER", ["USERID", "USERNAME", "ISADMIN"]),
      type: "SELECT",
      tableName: "T_USER",
      duration: 8,
      rowsAffected: users.length,
      plan: "INDEX FAST FULL SCAN | SYS_C0011108 | 6 rows | Cost: 1",
    });

    addEntry({
      operation: "查询借阅记录 (v$SQLAREA)",
      sql: `SELECT b.BORROWID, bi.BOOKNAME, u.USERNAME, b.BORROWDATE\nFROM "SYSTEM"."T_BORROW" b\nJOIN "SYSTEM"."T_BOOK_INFO" bi ON b.BOOKID = bi.BOOKID\nJOIN "SYSTEM"."T_USER" u ON b.USERID = u.USERID\nORDER BY b.BORROWDATE DESC`,
      type: "SELECT",
      tableName: "T_BORROW",
      duration: 23,
      rowsAffected: borrowRecords.length,
      plan: "NESTED LOOPS | | 3 rows | Cost: 5\n  TABLE ACCESS FULL | T_BORROW\n  INDEX UNIQUE SCAN | SYS_C0011124\n  INDEX UNIQUE SCAN | SYS_C0011108",
    });
  }, [addEntry, borrowRecords.length]);

  const stats = useMemo(() => {
    const totalBooks = books.length;
    const totalUsers = users.length;
    const totalTypes = bookTypes.length;
    const totalValue = books.reduce((sum, b) => sum + b.bookPrice, 0);
    const availableBooks = books.filter((b) => b.isBorrowed === 0).length;
    const borrowedBooks = books.filter((b) => b.isBorrowed === 1).length;
    const userRecords = user.isAdmin === 1 ? borrowRecords : borrowRecords.filter((r) => r.userName === user.userName);
    const activeBorrows = userRecords.filter((r) => r.status === "active").length;
    const returnedBorrows = userRecords.filter((r) => r.status === "returned").length;
    return { totalBooks, totalUsers, totalTypes, totalValue, availableBooks, borrowedBooks, activeBorrows, returnedBorrows };
  }, [borrowRecords, books, user.isAdmin, user.userName]);

  const statCards = [
    { label: "图书总数", value: stats.totalBooks, icon: BookOpen, color: "#C084FC", page: "books", table: "T_BOOK_INFO", pk: "SYS_C0011124" },
    { label: "注册用户", value: stats.totalUsers, icon: Users, color: "#22D3EE", page: "users", table: "T_USER", pk: "SYS_C0011108" },
    { label: "图书分类", value: stats.totalTypes, icon: Layers, color: "#F472B6", page: "books", table: "T_BOOK_TYPE", pk: "SYS_C0011121" },
    { label: "馆藏总价", value: `¥${stats.totalValue.toFixed(0)}`, icon: TrendingUp, color: "#FBBF24", page: "books", table: "T_BOOK_INFO", pk: "SUM(BOOKPRICE)" },
    { label: "可借阅", value: stats.availableBooks, icon: BookOpen, color: "#4ADE80", page: "books", table: "T_BOOK_INFO", pk: "ISBORROWED=0" },
    { label: "已借出", value: stats.borrowedBooks, icon: Clock, color: "#F87171", page: "borrows", table: "T_BORROW", pk: "FK_BORROW_BOOK" },
    { label: "活跃借阅", value: stats.activeBorrows, icon: Zap, color: "#A78BFA", page: "borrows", table: "T_BORROW", pk: "STATUS=ACTIVE" },
    { label: "已归还", value: stats.returnedBorrows, icon: TrendingUp, color: "#34D399", page: "borrows", table: "T_BORROW", pk: "STATUS=RETURNED" },
  ];

  // 点击统计卡片时的审计
  const handleCardClick = (card: typeof statCards[0]) => {
    const where = card.pk.includes("=") ? card.pk : undefined;
    addEntry({
      operation: `统计查询: ${card.label}`,
      sql: generateSelectSQL(card.table, ["COUNT(*)"], where),
      type: "SELECT",
      tableName: card.table,
      duration: Math.floor(Math.random() * 15) + 5,
      rowsAffected: 1,
      plan: `INDEX ${card.table === "T_BOOK_TYPE" ? "FAST FULL SCAN" : "RANGE SCAN"} | ${card.pk} | Cost: ${Math.floor(Math.random() * 3) + 1}`,
    });
    onNavigate(card.page);
  };

  const recentActivities: { text: string; time: string; color: string; sql?: string }[] = [
    { text: `用户 ${user.userName} 登录系统`, time: new Date().toLocaleTimeString("zh-CN", { hour12: false }), color: "#4ADE80", sql: `SELECT * FROM "SYSTEM"."T_USER" WHERE USERNAME = '${user.userName}' AND USERPASSWORD = '***'` },
    { text: "系统从 v$SYSSTAT 读取性能指标", time: "--", color: "#22D3EE", sql: `SELECT NAME, VALUE FROM v$SYSSTAT WHERE NAME IN ('db block gets', 'consistent gets', 'physical reads')` },
    { text: "触发器 t_user_trig 就绪 (BEFORE INSERT)", time: "--", color: "#A78BFA", sql: `SELECT TRIGGER_NAME, STATUS FROM DBA_TRIGGERS WHERE TABLE_NAME = 'T_USER'` },
    { text: "序列 seq_t_user 当前值: 17", time: "--", color: "#FBBF24", sql: `SELECT seq_t_user.CURRVAL FROM DUAL` },
    { text: "表空间 SYSTEM 使用率: 76.2%", time: "--", color: "#F472B6", sql: `SELECT TABLESPACE_NAME, ROUND((USED_SPACE*8192)/1024/1024,2) USED_MB\nFROM DBA_TABLESPACE_USAGE_METRICS WHERE TABLESPACE_NAME = 'SYSTEM'` },
    ...(user.isAdmin === 1 ? borrowRecords : borrowRecords.filter((r) => r.userName === user.userName)).slice(-3).reverse().map((r) => ({
      text: r.status === "active" ? `${r.userName} 借阅《${r.bookName}》` : `${r.userName} 归还《${r.bookName}》`,
      time: r.borrowDate,
      color: r.status === "active" ? "#C084FC" : "#22D3EE",
      sql: r.status === "active"
        ? `INSERT INTO "SYSTEM"."T_BORROW" (BOOKID, USERID, BORROWDATE) VALUES (${r.bookId}, (SELECT USERID FROM T_USER WHERE USERNAME='${r.userName}'), TO_DATE('${r.borrowDate}','YYYY-MM-DD'))`
        : `UPDATE "SYSTEM"."T_BORROW" SET RETURNDATE = SYSDATE, STATUS = 'RETURNED' WHERE BORROWID = ${r.borrowId}`,
    })),
  ];

  // Oracle特性快速链接
  const featureLinks = [
    { label: "数据表", icon: TableProperties, page: "schema", color: "#C084FC" },
    { label: "主键/外键", icon: KeyRound, page: "schema", color: "#22D3EE" },
    { label: "触发器", icon: Zap, page: "oracle", color: "#F472B6", tab: "trigger" },
    { label: "索引", icon: Search, page: "oracle", color: "#FBBF24", tab: "index" },
    { label: "视图", icon: Eye, page: "oracle", color: "#4ADE80", tab: "view" },
    { label: "存储过程", icon: Code2, page: "oracle", color: "#A78BFA", tab: "procedure" },
    { label: "大对象", icon: FileImage, page: "oracle", color: "#FB923C", tab: "lob" },
    { label: "表空间", icon: Database, page: "oracle", color: "#C084FC", tab: "tablespace" },
  ];

  const handleFeatureClick = (feat: typeof featureLinks[0]) => {
    addEntry({
      operation: `查看Oracle特性: ${feat.label}`,
      sql: `-- ${feat.label} 特性文档查询\nSELECT * FROM DBA_OBJECTS WHERE OBJECT_TYPE = '${feat.label === "主键/外键" ? "CONSTRAINT" : feat.label.toUpperCase()}'`,
      type: "SELECT",
      tableName: "DBA_OBJECTS",
      duration: 15,
      rowsAffected: 4,
    });
    onNavigate(feat.page);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 欢迎区域 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#0f172a" }}>
            欢迎回来，<span style={{ color: "#C084FC" }}>{user.userName}</span>
            {user.isAdmin === 1 && (
              <span className="ml-2 px-2 py-0.5 rounded text-xs font-mono border" style={{ backgroundColor: "rgba(34,211,238,0.1)", borderColor: "rgba(34,211,238,0.3)", color: "#22D3EE" }}>
                <Shield size={10} className="inline mr-1" />管理员
              </span>
            )}
          </h1>
          <p className="text-sm font-mono" style={{ color: "#64748B" }}>
            <Database size={12} className="inline mr-1" />
            SYSTEM@ORCL11g · SID: {Math.floor(Math.random() * 900) + 100} · SCN: {Date.now()}
          </p>
        </div>
      </div>

      {/* Oracle性能指标 */}
      <OracleMetrics />

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={() => handleCardClick(card)}
            className="rounded-xl border border-slate-200 p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 group"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#64748B" }} />
            </div>
            <div className="text-2xl font-bold font-mono mb-1" style={{ color: "#0f172a" }}>{card.value}</div>
            <div className="text-xs mb-1" style={{ color: "#64748B" }}>{card.label}</div>
            <div className="text-[10px] font-mono" style={{ color: "#cbd5e1" }}>{card.table}.{card.pk}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 图书分类分布 */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 p-6" style={{ backgroundColor: "#ffffff" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold" style={{ color: "#0f172a" }}>图书分类分布</h3>
            <button onClick={() => onNavigate("books")} className="text-xs flex items-center gap-1 transition-colors hover:text-purple-400" style={{ color: "#64748B" }}>
              查看全部 <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {bookTypes.map((type) => {
              const count = books.filter((b) => b.bookTypeId === type.bookTypeId).length;
              const percentage = books.length > 0 ? (count / books.length) * 100 : 0;
              const colors = ["#C084FC", "#22D3EE", "#F472B6", "#FBBF24", "#4ADE80", "#FB923C"];
              return (
                <div key={type.bookTypeId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm" style={{ color: "#475569" }}>{type.bookTypeName}</span>
                    <span className="text-xs font-mono" style={{ color: "#64748B" }}>{count} 本</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, backgroundColor: colors[type.bookTypeId % colors.length] }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* SQL提示 */}
          <div className="mt-5 p-3 rounded-lg border border-slate-200" style={{ backgroundColor: "#f1f5f9" }}>
            <div className="text-[10px] font-mono mb-1" style={{ color: "#22D3EE" }}>v$SQL - 最近执行的分类统计查询</div>
            <pre className="text-[11px] overflow-x-auto" style={{ color: "#64748B", fontFamily: '"JetBrains Mono", monospace' }}>
              <code>SELECT bt.BOOKTYPENAME, COUNT(*) AS cnt FROM T_BOOK_INFO bi JOIN T_BOOK_TYPE bt ON bi.BOOKTYPEID = bt.BOOKTYPEID GROUP BY bt.BOOKTYPENAME</code>
            </pre>
          </div>
        </div>

        {/* 右侧：系统动态 + Oracle特性 */}
        <div className="space-y-6">
          {/* 系统动态 */}
          <div className="rounded-xl border border-slate-200 p-5" style={{ backgroundColor: "#ffffff" }}>
            <div className="flex items-center gap-2 mb-4">
              <Database size={14} style={{ color: "#C084FC" }} />
              <h3 className="text-sm font-semibold" style={{ color: "#0f172a" }}>系统动态</h3>
              <span className="text-[10px] font-mono ml-auto" style={{ color: "#64748B" }}>v$SESSION</span>
            </div>
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: activity.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed" style={{ color: "#475569" }}>{activity.text}</p>
                    {activity.sql && (
                      <pre className="text-[9px] mt-1 p-1.5 rounded overflow-x-auto" style={{ backgroundColor: "#f1f5f9", color: "#64748B", fontFamily: '"JetBrains Mono", monospace' }}>
                        <code className="whitespace-pre-wrap break-all">{activity.sql}</code>
                      </pre>
                    )}
                    <p className="text-[10px] mt-0.5 font-mono" style={{ color: "#64748B" }}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Oracle特性快速链接 */}
          <div className="rounded-xl border border-slate-200 p-5" style={{ backgroundColor: "#ffffff" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#0f172a" }}>Oracle 特性</h3>
            <div className="grid grid-cols-2 gap-2">
              {featureLinks.map((feat) => (
                <button
                  key={feat.label}
                  onClick={() => handleFeatureClick(feat)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-xs transition-all hover:border-slate-300 hover:bg-slate-50"
                  style={{ color: "#475569" }}
                >
                  <feat.icon size={12} style={{ color: feat.color }} />
                  {feat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
