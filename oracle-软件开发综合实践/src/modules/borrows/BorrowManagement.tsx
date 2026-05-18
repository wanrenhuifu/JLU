import { useState } from "react";
import { type Book, type BorrowRecord } from "@/types";
import { useAudit, generateUpdateSQL } from "@/contexts/AuditContext";
import {
  BookOpen, RotateCcw, Clock, CheckCircle2, User, Calendar,
  Database, Code, PlayCircle,
} from "lucide-react";

interface BorrowManagementProps {
  records: BorrowRecord[];
  onReturn: (borrowId: number) => void;
  onBorrow: (book: Book) => void;
  user: { userName: string; isAdmin: number };
  books: Book[];
}

export default function BorrowManagement({ records, onReturn, onBorrow, user, books }: BorrowManagementProps) {
  const [activeTab, setActiveTab] = useState<"active" | "returned" | "all">("active");
  const { addEntry } = useAudit();

  const isAdmin = user.isAdmin === 1;
  const visibleRecords = isAdmin ? records : records.filter((r) => r.userName === user.userName);
  const filtered = visibleRecords.filter((r) => activeTab === "all" ? true : r.status === activeTab);
  const availableBooks = books.filter((b) => b.isBorrowed === 0);

  const handleQuickBorrow = (book: Book) => {
    // 事务开始
    addEntry({
      operation: "事务开始: 借阅图书 (BEGIN TRANSACTION)",
      sql: `BEGIN\n  SAVEPOINT sp_borrow_${Date.now() % 10000};\n  -- 事务隔离级别: READ COMMITTED`,
      type: "TRANSACTION",
      tableName: "T_BORROW",
      duration: 2,
      rowsAffected: 0,
    });
    // 调用存储过程
    addEntry({
      operation: "执行存储过程 SP_BORROW_BOOK",
      sql: `DECLARE\n  v_result NUMBER;\nBEGIN\n  SP_BORROW_BOOK(\n    p_bookid  => ${book.bookId},\n    p_userid  => (SELECT USERID FROM T_USER WHERE USERNAME = SESSION_USER),\n    p_result  => v_result\n  );\n  IF v_result = 1 THEN\n    DBMS_OUTPUT.PUT_LINE('借阅成功');\n  END IF;\nEND;`,
      type: "PLSQL",
      tableName: "T_BORROW",
      duration: 45,
      rowsAffected: 2,
      plan: "PROCEDURE EXECUTE | SP_BORROW_BOOK | PL/SQL Block",
    });
    // UPDATE图书状态
    addEntry({
      operation: "UPDATE: 标记图书为已借出",
      sql: generateUpdateSQL("T_BOOK_INFO", "ISBORROWED = 1", `BOOKID = ${book.bookId}`),
      type: "UPDATE",
      tableName: "T_BOOK_INFO",
      duration: 8,
      rowsAffected: 1,
      plan: `INDEX UNIQUE SCAN | SYS_C0011124 | Cost: 1`,
    });
    // INSERT借阅记录
    addEntry({
      operation: "INSERT: 创建借阅记录",
      sql: `INSERT INTO "SYSTEM"."T_BORROW" (BORROWID, BOOKID, USERID, BORROWDATE)\nVALUES (seq_t_borrow.NEXTVAL, ${book.bookId},\n  (SELECT USERID FROM T_USER WHERE ROWNUM=1),\n  SYSDATE)`,
      type: "INSERT",
      tableName: "T_BORROW",
      duration: 15,
      rowsAffected: 1,
    });
    // 触发器
    addEntry({
      operation: "触发器 t_borrow_trig 执行 (BEFORE INSERT)",
      sql: `TRIGGER "t_borrow_trig"\n  BEFORE INSERT ON T_BORROW\n  FOR EACH ROW\nBEGIN\n  SELECT seq_t_borrow.NEXTVAL INTO :NEW.BORROWID FROM DUAL;\n  -- 触发器自动填充: BORROWID, BORROWDATE=SYSDATE\nEND;`,
      type: "TRIGGER",
      tableName: "T_BORROW",
      duration: 3,
      rowsAffected: 0,
    });
    // COMMIT
    addEntry({
      operation: "事务提交 (COMMIT)",
      sql: `COMMIT;\n-- 事务已持久化到 Redo Log Buffer\n-- SCN: ${Date.now()}`,
      type: "TRANSACTION",
      tableName: "T_BORROW",
      duration: 6,
      rowsAffected: 0,
    });
    onBorrow(book);
  };

  const handleReturn = (borrowId: number) => {
    addEntry({
      operation: "事务开始: 归还图书",
      sql: `BEGIN\n  SAVEPOINT sp_return_${Date.now() % 10000};`,
      type: "TRANSACTION",
      tableName: "T_BORROW",
      duration: 2,
      rowsAffected: 0,
    });
    addEntry({
      operation: "UPDATE: 更新借阅记录为已归还",
      sql: generateUpdateSQL("T_BORROW", "RETURNDATE = SYSDATE, STATUS = 'RETURNED'", `BORROWID = ${borrowId}`),
      type: "UPDATE",
      tableName: "T_BORROW",
      duration: 12,
      rowsAffected: 1,
    });
    // 找到对应的bookId
    const record = records.find((r) => r.borrowId === borrowId);
    if (record) {
      addEntry({
        operation: "UPDATE: 标记图书为可借阅",
        sql: generateUpdateSQL("T_BOOK_INFO", "ISBORROWED = 0", `BOOKID = ${record.bookId}`),
        type: "UPDATE",
        tableName: "T_BOOK_INFO",
        duration: 8,
        rowsAffected: 1,
      });
    }
    addEntry({
      operation: "事务提交 (COMMIT)",
      sql: `COMMIT;`,
      type: "TRANSACTION",
      tableName: "T_BORROW",
      duration: 5,
      rowsAffected: 0,
    });
    onReturn(borrowId);
  };

  const handleTabChange = (tab: "active" | "returned" | "all") => {
    setActiveTab(tab);
    const where = tab === "active" ? "b.RETURNDATE IS NULL" : tab === "returned" ? "b.RETURNDATE IS NOT NULL" : undefined;
    addEntry({
      operation: `借阅记录查询 (${tab})`,
      sql: `SELECT b.BORROWID, bi.BOOKNAME, u.USERNAME, b.BORROWDATE, b.RETURNDATE\nFROM "SYSTEM"."T_BORROW" b\nJOIN "SYSTEM"."T_BOOK_INFO" bi ON b.BOOKID = bi.BOOKID\nJOIN "SYSTEM"."T_USER" u ON b.USERID = u.USERID${where ? `\nWHERE ${where}` : ""}\nORDER BY b.BORROWDATE DESC`,
      type: "SELECT",
      tableName: "T_BORROW",
      duration: 18,
      rowsAffected: filtered.length,
      plan: "NESTED LOOPS | | Cost: 6\n  TABLE ACCESS FULL | T_BORROW\n  INDEX UNIQUE SCAN | SYS_C0011124 | T_BOOK_INFO\n  INDEX UNIQUE SCAN | SYS_C0011108 | T_USER",
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>借阅管理</h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: "#64748B" }}>
            <Database size={10} className="inline mr-1" />T_BORROW · PK: SYS_C0011130 · FK: FK_BORROW_BOOK, FK_BORROW_USER · Trigger: t_borrow_trig
          </p>
        </div>
      </div>

      {/* Tab切换 */}
      <div className="flex gap-2 mb-6 p-1 rounded-lg" style={{ backgroundColor: "#f1f5f9" }}>
        {[
          { key: "active" as const, label: "活跃借阅", count: visibleRecords.filter((r) => r.status === "active").length, icon: Clock, color: "#C084FC" },
          { key: "returned" as const, label: "已归还", count: visibleRecords.filter((r) => r.status === "returned").length, icon: CheckCircle2, color: "#22D3EE" },
          { key: "all" as const, label: "全部记录", count: visibleRecords.length, icon: BookOpen, color: "#475569" },
        ].map((tab) => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all border flex-1 justify-center" style={{ backgroundColor: activeTab === tab.key ? `${tab.color}15` : "transparent", borderColor: activeTab === tab.key ? `${tab.color}40` : "transparent", color: activeTab === tab.key ? tab.color : "#64748B" }}>
            <tab.icon size={14} />{tab.label}<span className="px-1.5 py-0.5 rounded-full text-xs font-mono" style={{ backgroundColor: `${tab.color}15`, color: tab.color }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* 存储过程说明 */}
      <div className="mb-6 p-3 rounded-lg border border-purple-500/10 flex items-start gap-3" style={{ backgroundColor: "rgba(192,132,252,0.03)" }}>
        <PlayCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#C084FC" }} />
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: "#C084FC" }}>存储过程: SP_BORROW_BOOK</div>
          <pre className="text-[10px]" style={{ color: "#64748B", fontFamily: '"JetBrains Mono", monospace' }}>
            <code>PROCEDURE SP_BORROW_BOOK(p_bookid IN NUMBER, p_userid IN NUMBER, p_result OUT NUMBER)\n  IS: 检查图书可借状态 → UPDATE T_BOOK_INFO SET ISBORROWED=1 → INSERT INTO T_BORROW → p_result:=1</code>
          </pre>
        </div>
      </div>

      {/* 可借阅图书 */}
      {activeTab === "active" && (
        <div className="mb-6 rounded-xl border border-slate-200 p-5" style={{ backgroundColor: "#ffffff" }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#0f172a" }}>
            <BookOpen size={14} style={{ color: "#4ADE80" }} />可借阅图书<span className="font-mono text-xs" style={{ color: "#64748B" }}>({availableBooks.length})</span>
          </h3>
          {availableBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableBooks.slice(0, 6).map((book) => (
                <div key={book.bookId} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                  <img src={book.bookImg} alt="" className="w-10 h-14 object-cover rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate" style={{ color: "#0f172a" }}>{book.bookName}</div>
                    <div className="text-xs" style={{ color: "#64748B" }}>{book.bookAuthor} · ¥{book.bookPrice}</div>
                  </div>
                  <button onClick={() => handleQuickBorrow(book)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs transition-all flex-shrink-0" style={{ backgroundColor: "rgba(34,211,238,0.1)", color: "#22D3EE" }}>借阅</button>
                </div>
              ))}
            </div>
          ) : <div className="text-center py-6 text-sm" style={{ color: "#64748B" }}>暂无可借阅图书</div>}
        </div>
      )}

      {/* SQL提示 */}
      <div className="mb-3 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2" style={{ backgroundColor: "#f1f5f9" }}>
        <Code size={12} style={{ color: "#22D3EE" }} />
        <span className="text-[10px] font-mono" style={{ color: "#64748B" }}>
          JOIN T_BORROW → T_BOOK_INFO (FK_BORROW_BOOK) → T_USER (FK_BORROW_USER) · 触发器: t_borrow_trig (BEFORE INSERT)
        </span>
      </div>

      {/* 借阅记录表格 */}
      <div className="rounded-xl border border-slate-200 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9" }}>
                <th className="text-left px-4 py-3 text-xs font-mono" style={{ color: "#64748B" }}>BORROWID</th>
                <th className="text-left px-4 py-3 text-xs font-mono" style={{ color: "#64748B" }}>图书</th>
                <th className="text-left px-4 py-3 text-xs font-mono" style={{ color: "#64748B" }}>借阅人</th>
                <th className="text-left px-4 py-3 text-xs font-mono" style={{ color: "#64748B" }}>借阅日期</th>
                <th className="text-left px-4 py-3 text-xs font-mono" style={{ color: "#64748B" }}>归还日期</th>
                <th className="text-left px-4 py-3 text-xs font-mono" style={{ color: "#64748B" }}>状态</th>
                <th className="text-right px-4 py-3 text-xs font-mono" style={{ color: "#64748B" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <tr key={record.borrowId} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#64748B" }}>{record.borrowId}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#0f172a" }}>{record.bookName}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1.5"><User size={12} style={{ color: "#64748B" }} /><span className="text-sm" style={{ color: "#475569" }}>{record.userName}</span></div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1.5"><Calendar size={12} style={{ color: "#64748B" }} /><span className="text-sm font-mono" style={{ color: "#475569" }}>{record.borrowDate}</span></div></td>
                  <td className="px-4 py-3">{record.returnDate ? <span className="text-sm font-mono" style={{ color: "#22D3EE" }}>{record.returnDate}</span> : <span className="text-sm" style={{ color: "#64748B" }}>-</span>}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs w-fit" style={{ backgroundColor: record.status === "active" ? "rgba(192,132,252,0.1)" : "rgba(34,211,238,0.1)", color: record.status === "active" ? "#C084FC" : "#22D3EE" }}>{record.status === "active" ? <Clock size={10} /> : <CheckCircle2 size={10} />}{record.status === "active" ? "借阅中" : "已归还"}</span></td>
                  <td className="px-4 py-3 text-right">{record.status === "active" && <button onClick={() => handleReturn(record.borrowId)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs transition-all ml-auto" style={{ backgroundColor: "rgba(34,211,238,0.1)", color: "#22D3EE" }}><RotateCcw size={12} />归还</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="py-12 text-center"><BookOpen size={32} className="mx-auto mb-3" style={{ color: "#cbd5e1" }} /><p style={{ color: "#64748B" }}>暂无{activeTab === "active" ? "活跃借阅" : activeTab === "returned" ? "归还记录" : "记录"}</p></div>}
      </div>
    </div>
  );
}
