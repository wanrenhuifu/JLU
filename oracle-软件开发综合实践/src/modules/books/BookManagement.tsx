import { useState, useEffect, useRef } from "react";
import type { Book, BookType } from "@/types";
import { useAudit, generateSelectSQL, generateInsertSQL, generateUpdateSQL, generateDeleteSQL } from "@/contexts/AuditContext";
import {
  Plus, Search, Pencil, Trash2, X, BookOpen, Save, Tag, DollarSign, User,
  FileText, AlertCircle, Filter, Database, Code, KeyRound, Layers,
} from "lucide-react";

interface BookManagementProps {
  user: { userName: string; isAdmin: number };
  onBorrowBook?: (book: Book) => void;
  books: Book[];
  onUpdateBooks: (books: Book[]) => void;
  bookTypes: BookType[];
  onUpdateBookTypes: (types: BookType[]) => void;
}

// 动态计算下一个图书ID（兼容 localStorage 持久化后的数据）
function getNextBookId(books: Book[]) {
  return books.reduce((max, b) => Math.max(max, b.bookId), 0) + 1;
}

function getNextTypeId(types: BookType[]) {
  return types.reduce((max, t) => Math.max(max, t.bookTypeId), 0) + 1;
}

export default function BookManagement({ user, onBorrowBook, books, onUpdateBooks, bookTypes, onUpdateBookTypes }: BookManagementProps) {
  const [activeTab, setActiveTab] = useState<"books" | "types">("books");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const { addEntry } = useAudit();

  const [form, setForm] = useState<Partial<Book>>({
    bookName: "", bookAuthor: "", bookPrice: 0, bookTypeId: 1,
    bookDesc: "", bookImg: "/images/book-java.jpg", isBorrowed: 0,
  });

  // 分类管理状态
  const [typeForm, setTypeForm] = useState<Partial<BookType>>({ bookTypeName: "", bookTypeDesc: "" });
  const [editingType, setEditingType] = useState<BookType | null>(null);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [typeFormError, setTypeFormError] = useState("");
  const [deleteTypeConfirm, setDeleteTypeConfirm] = useState<number | null>(null);

  const filtered = books.filter((b) => {
    const matchSearch = !search || b.bookName.toLowerCase().includes(search.toLowerCase()) || b.bookAuthor.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === null || b.bookTypeId === filterType;
    return matchSearch && matchType;
  });

  const isAdmin = user.isAdmin === 1;

  // 初始查询审计
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    addEntry({
      operation: "图书列表查询 (全表扫描)",
      sql: generateSelectSQL("T_BOOK_INFO", ["BOOKID", "BOOKNAME", "BOOKAUTHOR", "BOOKPRICE", "BOOKTYPEID", "BOOKDESC", "ISBORROWED"], undefined, "BOOKID"),
      type: "SELECT",
      tableName: "T_BOOK_INFO",
      duration: 18,
      rowsAffected: books.length,
      plan: "TABLE ACCESS FULL | T_BOOK_INFO | 9 rows | Cost: 3\n  SORT ORDER BY | BOOKID",
    });
  }, [addEntry, books.length]);

  const resetForm = () => {
    setForm({ bookName: "", bookAuthor: "", bookPrice: 0, bookTypeId: 1, bookDesc: "", bookImg: "/images/book-java.jpg", isBorrowed: 0 });
    setFormError("");
    setEditingBook(null);
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
    addEntry({
      operation: "准备新增图书 (获取序列值)",
      sql: `SELECT seq_t_book_info.NEXTVAL AS new_bookid FROM DUAL`,
      type: "SELECT",
      tableName: "DUAL",
      duration: 5,
      rowsAffected: 1,
    });
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setForm({ ...book });
    setFormError("");
    setShowForm(true);
    addEntry({
      operation: `准备编辑图书 (WHERE 主键查询)`,
      sql: generateSelectSQL("T_BOOK_INFO", ["*"], `BOOKID = ${book.bookId}`),
      type: "SELECT",
      tableName: "T_BOOK_INFO",
      duration: 8,
      rowsAffected: 1,
      plan: `INDEX UNIQUE SCAN | SYS_C0011124 | BOOKID = ${book.bookId} | Cost: 1`,
    });
  };

  const handleSave = () => {
    if (!form.bookName?.trim()) { setFormError("请输入图书名称"); return; }
    if (!form.bookAuthor?.trim()) { setFormError("请输入作者"); return; }
    if (!form.bookPrice || form.bookPrice <= 0) { setFormError("请输入有效的价格"); return; }

    const typeId = form.bookTypeId || 1;
    const typeName = bookTypes.find((t) => t.bookTypeId === typeId)?.bookTypeName || "未知";

    if (editingBook) {
      const setClause = `BOOKNAME = '${form.bookName}', BOOKAUTHOR = '${form.bookAuthor}', BOOKPRICE = ${form.bookPrice}, BOOKTYPEID = ${typeId}, BOOKDESC = '${form.bookDesc?.slice(0, 20)}...'`;
      addEntry({
        operation: `UPDATE 修改图书 (触发器检查外键)`,
        sql: generateUpdateSQL("T_BOOK_INFO", setClause, `BOOKID = ${editingBook.bookId}`),
        type: "UPDATE",
        tableName: "T_BOOK_INFO",
        duration: 15,
        rowsAffected: 1,
        plan: `INDEX UNIQUE SCAN | SYS_C0011124 | BOOKID = ${editingBook.bookId} | Cost: 1\n  TABLE ACCESS BY INDEX ROWID | T_BOOK_INFO`,
      });
      addEntry({
        operation: "外键约束验证 (FK_BOOK_TYPE)",
        sql: `SELECT BOOKTYPEID FROM "SYSTEM"."T_BOOK_TYPE" WHERE BOOKTYPEID = ${typeId}`,
        type: "SELECT",
        tableName: "T_BOOK_TYPE",
        duration: 6,
        rowsAffected: 1,
        plan: "INDEX UNIQUE SCAN | SYS_C0011121 | Cost: 1",
      });
      onUpdateBooks(books.map((b) => (b.bookId === editingBook.bookId ? { ...b, ...form, bookTypeName: typeName } as Book : b)));
    } else {
      const newId = getNextBookId(books);
      const newBook: Book = {
        bookId: newId, bookName: form.bookName || "", bookAuthor: form.bookAuthor || "",
        bookPrice: form.bookPrice || 0, bookTypeId: typeId, bookTypeName: typeName,
        bookDesc: form.bookDesc || "", bookImg: form.bookImg || "/images/book-java.jpg", isBorrowed: 0,
      };
      addEntry({
        operation: "触发器 t_book_info_trig 执行 (BEFORE INSERT)",
        sql: `CREATE TRIGGER "t_book_info_trig"\n  BEFORE INSERT ON "SYSTEM"."T_BOOK_INFO"\n  FOR EACH ROW\nBEGIN\n  SELECT seq_t_book_info.NEXTVAL INTO :NEW.BOOKID FROM DUAL;\n  -- 自动分配 ID: ${newId}\nEND;`,
        type: "TRIGGER",
        tableName: "T_BOOK_INFO",
        duration: 3,
        rowsAffected: 0,
      });
      addEntry({
        operation: "INSERT 新增图书",
        sql: generateInsertSQL("T_BOOK_INFO", ["BOOKID", "BOOKNAME", "BOOKAUTHOR", "BOOKPRICE", "BOOKTYPEID", "BOOKDESC", "ISBORROWED", "BOOKIMG"], [newId, form.bookName || "", form.bookAuthor || "", form.bookPrice || 0, typeId, (form.bookDesc || "").slice(0, 30), 0, form.bookImg || ""]),
        type: "INSERT",
        tableName: "T_BOOK_INFO",
        duration: 22,
        rowsAffected: 1,
        plan: `TABLE ACCESS FULL | T_BOOK_INFO | Cost: 3`,
      });
      onUpdateBooks([...books, newBook]);
    }
    setShowForm(false);
    resetForm();
  };

  const handleDelete = (bookId: number) => {
    addEntry({
      operation: "DELETE前检查外键引用 (T_BORROW)",
      sql: `SELECT COUNT(*) FROM "SYSTEM"."T_BORROW" WHERE BOOKID = ${bookId}`,
      type: "SELECT",
      tableName: "T_BORROW",
      duration: 8,
      rowsAffected: 1,
      plan: "INDEX RANGE SCAN | FK_BORROW_BOOK | Cost: 1",
    });
    addEntry({
      operation: `DELETE 删除图书`,
      sql: generateDeleteSQL("T_BOOK_INFO", `BOOKID = ${bookId}`),
      type: "DELETE",
      tableName: "T_BOOK_INFO",
      duration: 18,
      rowsAffected: 1,
      plan: `INDEX UNIQUE SCAN | SYS_C0011124 | BOOKID = ${bookId} | Cost: 1`,
    });
    onUpdateBooks(books.filter((b) => b.bookId !== bookId));
    setDeleteConfirm(null);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value.length > 0) {
      addEntry({
        operation: `模糊查询图书 (LIKE '%${value}%')`,
        sql: `SELECT * FROM "SYSTEM"."T_BOOK_INFO" WHERE BOOKNAME LIKE '%${value}%' OR BOOKAUTHOR LIKE '%${value}%'`,
        type: "SELECT",
        tableName: "T_BOOK_INFO",
        duration: 12,
        rowsAffected: filtered.length,
        plan: "TABLE ACCESS FULL | T_BOOK_INFO | FILTER: LIKE | Cost: 3",
      });
    }
  };

  const handleBorrow = (book: Book) => {
    if (onBorrowBook) {
      addEntry({
        operation: "事务开始: 借阅图书",
        sql: `BEGIN\n  -- Transaction Start\n  SAVEPOINT sp_borrow_${Date.now()};`,
        type: "TRANSACTION",
        tableName: "T_BORROW",
        duration: 2,
        rowsAffected: 0,
      });
      onBorrowBook(book);
      addEntry({
        operation: "UPDATE 标记图书已借出",
        sql: generateUpdateSQL("T_BOOK_INFO", "ISBORROWED = 1", `BOOKID = ${book.bookId}`),
        type: "UPDATE",
        tableName: "T_BOOK_INFO",
        duration: 10,
        rowsAffected: 1,
      });
      addEntry({
        operation: "事务提交: COMMIT",
        sql: `  COMMIT;\nEND;\n-- Transaction committed successfully`,
        type: "TRANSACTION",
        tableName: "T_BORROW",
        duration: 5,
        rowsAffected: 1,
      });
    }
  };

  const getTypeName = (typeId: number) => bookTypes.find((t) => t.bookTypeId === typeId)?.bookTypeName || "未知";

  // ====== 图书分类管理 ======
  const resetTypeForm = () => {
    setTypeForm({ bookTypeName: "", bookTypeDesc: "" });
    setTypeFormError("");
    setEditingType(null);
  };

  const openAddType = () => {
    resetTypeForm();
    setShowTypeForm(true);
    addEntry({
      operation: "准备新增图书分类",
      sql: `SELECT seq_t_book_type.NEXTVAL FROM DUAL`,
      type: "SELECT",
      tableName: "DUAL",
      duration: 4,
      rowsAffected: 1,
    });
  };

  const openEditType = (t: BookType) => {
    setEditingType(t);
    setTypeForm({ ...t });
    setTypeFormError("");
    setShowTypeForm(true);
  };

  const handleSaveType = () => {
    if (!typeForm.bookTypeName?.trim()) { setTypeFormError("请输入分类名称"); return; }
    if (editingType) {
      addEntry({
        operation: "UPDATE 修改图书分类",
        sql: generateUpdateSQL("T_BOOK_TYPE", `BOOKTYPENAME = '${typeForm.bookTypeName}', BOOKTYPEDESC = '${typeForm.bookTypeDesc}'`, `BOOKTYPEID = ${editingType.bookTypeId}`),
        type: "UPDATE",
        tableName: "T_BOOK_TYPE",
        duration: 10,
        rowsAffected: 1,
      });
      const updated = bookTypes.map((t) => t.bookTypeId === editingType.bookTypeId ? { ...t, ...typeForm } as BookType : t);
      onUpdateBookTypes(updated);
      // 同步更新图书中的分类名称
      onUpdateBooks(books.map((b) => b.bookTypeId === editingType.bookTypeId ? { ...b, bookTypeName: typeForm.bookTypeName || b.bookTypeName } : b));
    } else {
      const newId = getNextTypeId(bookTypes);
      const newType: BookType = {
        bookTypeId: newId,
        bookTypeName: typeForm.bookTypeName || "",
        bookTypeDesc: typeForm.bookTypeDesc || "",
      };
      addEntry({
        operation: "INSERT 新增图书分类",
        sql: generateInsertSQL("T_BOOK_TYPE", ["BOOKTYPEID", "BOOKTYPENAME", "BOOKTYPEDESC"], [newId, newType.bookTypeName, newType.bookTypeDesc]),
        type: "INSERT",
        tableName: "T_BOOK_TYPE",
        duration: 15,
        rowsAffected: 1,
      });
      onUpdateBookTypes([...bookTypes, newType]);
    }
    setShowTypeForm(false);
    resetTypeForm();
  };

  const handleDeleteType = (typeId: number) => {
    const usedCount = books.filter((b) => b.bookTypeId === typeId).length;
    if (usedCount > 0) {
      window.alert(`该分类下还有 ${usedCount} 本图书，无法删除。请先迁移或删除相关图书。`);
      setDeleteTypeConfirm(null);
      return;
    }
    addEntry({
      operation: "DELETE 删除图书分类",
      sql: generateDeleteSQL("T_BOOK_TYPE", `BOOKTYPEID = ${typeId}`),
      type: "DELETE",
      tableName: "T_BOOK_TYPE",
      duration: 12,
      rowsAffected: 1,
    });
    onUpdateBookTypes(bookTypes.filter((t) => t.bookTypeId !== typeId));
    setDeleteTypeConfirm(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Tab 切换 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>图书管理</h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: "#64748B" }}>
            <Database size={10} className="inline mr-1" />T_BOOK_INFO · PK: SYS_C0011124 · FK: FK_BOOK_TYPE → T_BOOK_TYPE
          </p>
        </div>
        <div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: "#f1f5f9" }}>
          <button
            onClick={() => setActiveTab("books")}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all border"
            style={{
              backgroundColor: activeTab === "books" ? "rgba(192,132,252,0.15)" : "transparent",
              borderColor: activeTab === "books" ? "rgba(192,132,252,0.3)" : "transparent",
              color: activeTab === "books" ? "#C084FC" : "#64748B",
            }}
          >
            <BookOpen size={14} /> 图书列表
          </button>
          <button
            onClick={() => setActiveTab("types")}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all border"
            style={{
              backgroundColor: activeTab === "types" ? "rgba(34,211,238,0.15)" : "transparent",
              borderColor: activeTab === "types" ? "rgba(34,211,238,0.3)" : "transparent",
              color: activeTab === "types" ? "#22D3EE" : "#64748B",
            }}
          >
            <Layers size={14} /> 图书分类
          </button>
        </div>
      </div>

      {activeTab === "books" ? (
        <>
          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} />
              <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="搜索图书名称或作者..." className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border outline-none transition-all" style={{ backgroundColor: "#f8fafc", borderColor: "rgba(0,0,0,0.08)", color: "#0f172a" }} />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} style={{ color: "#64748B" }} />
              <div className="flex gap-1">
                <button onClick={() => setFilterType(null)} className="px-3 py-2 rounded-lg text-xs transition-all border" style={{ backgroundColor: filterType === null ? "rgba(192,132,252,0.1)" : "#f8fafc", borderColor: filterType === null ? "rgba(192,132,252,0.3)" : "rgba(0,0,0,0.08)", color: filterType === null ? "#C084FC" : "#64748B" }}>全部</button>
                {bookTypes.map((t) => (
                  <button key={t.bookTypeId} onClick={() => setFilterType(t.bookTypeId)} className="px-3 py-2 rounded-lg text-xs transition-all border" style={{ backgroundColor: filterType === t.bookTypeId ? "rgba(192,132,252,0.1)" : "#f8fafc", borderColor: filterType === t.bookTypeId ? "rgba(192,132,252,0.3)" : "rgba(0,0,0,0.08)", color: filterType === t.bookTypeId ? "#C084FC" : "#64748B" }}>{t.bookTypeName}</button>
                ))}
              </div>
            </div>
            {isAdmin && (
              <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border" style={{ backgroundColor: "rgba(192,132,252,0.15)", borderColor: "rgba(192,132,252,0.3)", color: "#C084FC" }}>
                <Plus size={16} /> 新增图书
              </button>
            )}
          </div>

          {/* SQL提示 */}
          <div className="mb-3 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2" style={{ backgroundColor: "#f1f5f9" }}>
            <Code size={12} style={{ color: "#22D3EE" }} />
            <span className="text-[10px] font-mono" style={{ color: "#64748B" }}>
              {search ? `SELECT * FROM T_BOOK_INFO WHERE BOOKNAME LIKE '%${search}%'` : `SELECT * FROM T_BOOK_INFO ORDER BY BOOKID`} · Cost: 3 · 使用索引: SYS_C0011124 (PK)
            </span>
          </div>

          {/* 图书表格 */}
          <div className="rounded-xl border border-slate-200 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#f1f5f9" }}>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider" style={{ color: "#64748B" }}><KeyRound size={10} className="inline mr-1" />ID</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider" style={{ color: "#64748B" }}>图书信息</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider" style={{ color: "#64748B" }}>作者</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider" style={{ color: "#64748B" }}>分类</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider" style={{ color: "#64748B" }}>价格</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider" style={{ color: "#64748B" }}>状态</th>
                    <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-wider" style={{ color: "#64748B" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((book) => (
                    <tr key={book.bookId} className="border-t border-slate-200 transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "#64748B" }}>{book.bookId}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={book.bookImg} alt="" className="w-10 h-14 object-cover rounded" />
                          <div>
                            <div className="text-sm font-medium" style={{ color: "#0f172a" }}>{book.bookName}</div>
                            <div className="text-xs truncate max-w-[200px]" style={{ color: "#64748B" }}>{book.bookDesc.slice(0, 30)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#475569" }}>{book.bookAuthor}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs border" style={{ backgroundColor: "rgba(192,132,252,0.05)", borderColor: "rgba(192,132,252,0.15)", color: "#C084FC" }}>{getTypeName(book.bookTypeId)}</span></td>
                      <td className="px-4 py-3 font-mono text-sm" style={{ color: "#22D3EE" }}>¥{book.bookPrice}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: book.isBorrowed ? "rgba(248,113,113,0.1)" : "rgba(34,211,238,0.1)", color: book.isBorrowed ? "#F87171" : "#22D3EE" }}>{book.isBorrowed ? "已借出" : "可借阅"}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!book.isBorrowed && onBorrowBook && (
                            <button onClick={() => handleBorrow(book)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs transition-all" style={{ backgroundColor: "rgba(34,211,238,0.1)", color: "#22D3EE" }}><BookOpen size={12} />借阅</button>
                          )}
                          {isAdmin && (
                            <><button onClick={() => openEdit(book)} className="p-1.5 rounded-md transition-all hover:bg-slate-100" style={{ color: "#64748B" }}><Pencil size={14} /></button>
                            <button onClick={() => setDeleteConfirm(book.bookId)} className="p-1.5 rounded-md transition-all hover:bg-red-500/10" style={{ color: "#64748B" }}><Trash2 size={14} /></button></>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <div className="py-12 text-center"><BookOpen size={32} className="mx-auto mb-3" style={{ color: "#cbd5e1" }} /><p style={{ color: "#64748B" }}>没有找到匹配的图书</p></div>}
          </div>

          {/* 新增/编辑弹窗 */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={() => setShowForm(false)}>
              <div className="rounded-2xl border border-slate-200 overflow-hidden max-w-lg w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#ffffff" }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-slate-200">
                  <h3 className="text-lg font-semibold" style={{ color: "#0f172a" }}>{editingBook ? "编辑图书" : "新增图书"}</h3>
                  <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg transition-colors hover:bg-slate-100" style={{ color: "#64748B" }}><X size={18} /></button>
                </div>
                <div className="p-5 space-y-4">
                  {formError && <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(248,113,113,0.1)", color: "#F87171", border: "1px solid rgba(248,113,113,0.2)" }}><AlertCircle size={14} />{formError}</div>}
                  <div><label className="flex items-center gap-1.5 text-sm mb-2" style={{ color: "#475569" }}><BookOpen size={14} />图书名称</label><input type="text" value={form.bookName || ""} onChange={(e) => setForm({ ...form, bookName: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none" style={{ backgroundColor: "#f8fafc", borderColor: "rgba(0,0,0,0.08)", color: "#0f172a" }} /></div>
                  <div><label className="flex items-center gap-1.5 text-sm mb-2" style={{ color: "#475569" }}><User size={14} />作者</label><input type="text" value={form.bookAuthor || ""} onChange={(e) => setForm({ ...form, bookAuthor: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none" style={{ backgroundColor: "#f8fafc", borderColor: "rgba(0,0,0,0.08)", color: "#0f172a" }} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="flex items-center gap-1.5 text-sm mb-2" style={{ color: "#475569" }}><Tag size={14} />分类</label><select value={form.bookTypeId || 1} onChange={(e) => setForm({ ...form, bookTypeId: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none" style={{ backgroundColor: "#f8fafc", borderColor: "rgba(0,0,0,0.08)", color: "#0f172a" }}>{bookTypes.map((t) => <option key={t.bookTypeId} value={t.bookTypeId}>{t.bookTypeName}</option>)}</select></div>
                    <div><label className="flex items-center gap-1.5 text-sm mb-2" style={{ color: "#475569" }}><DollarSign size={14} />价格</label><input type="number" step="0.1" value={form.bookPrice || ""} onChange={(e) => setForm({ ...form, bookPrice: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none" style={{ backgroundColor: "#f8fafc", borderColor: "rgba(0,0,0,0.08)", color: "#0f172a" }} /></div>
                  </div>
                  <div><label className="flex items-center gap-1.5 text-sm mb-2" style={{ color: "#475569" }}><FileText size={14} />简介</label><textarea value={form.bookDesc || ""} onChange={(e) => setForm({ ...form, bookDesc: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none resize-none" style={{ backgroundColor: "#f8fafc", borderColor: "rgba(0,0,0,0.08)", color: "#0f172a" }} /></div>
                  <div className="p-3 rounded-lg border border-slate-200" style={{ backgroundColor: "#f1f5f9" }}>
                    <div className="text-[10px] font-mono mb-1" style={{ color: editingBook ? "#FBBF24" : "#4ADE80" }}>{editingBook ? "UPDATE SQL 预览" : "INSERT SQL 预览 (触发器自动分配ID)"}</div>
                    <pre className="text-[10px] overflow-x-auto" style={{ color: "#64748B", fontFamily: '"JetBrains Mono", monospace' }}>
                      <code>{editingBook ? generateUpdateSQL("T_BOOK_INFO", `BOOKNAME='${form.bookName?.slice(0, 15)}...'`, `BOOKID=${editingBook.bookId}`) : generateInsertSQL("T_BOOK_INFO", ["BOOKID","BOOKNAME","BOOKAUTHOR"], ["seq.NEXTVAL", form.bookName || "null", form.bookAuthor || "null"])}</code>
                    </pre>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg text-sm border transition-all hover:bg-slate-100" style={{ borderColor: "rgba(0,0,0,0.1)", color: "#64748B" }}>取消</button>
                    <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all border" style={{ backgroundColor: "rgba(192,132,252,0.15)", borderColor: "rgba(192,132,252,0.3)", color: "#C084FC" }}><Save size={14} />{editingBook ? "保存修改" : "添加图书"}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 删除确认 */}
          {deleteConfirm !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={() => setDeleteConfirm(null)}>
              <div className="rounded-2xl border border-slate-200 overflow-hidden max-w-sm w-full p-6" style={{ backgroundColor: "#ffffff" }} onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(248,113,113,0.1)" }}><Trash2 size={24} style={{ color: "#F87171" }} /></div>
                <h3 className="text-lg font-semibold text-center mb-2" style={{ color: "#0f172a" }}>确认删除</h3>
                <pre className="text-xs p-2 rounded mb-4 overflow-x-auto" style={{ backgroundColor: "#f1f5f9", color: "#64748B", fontFamily: '"JetBrains Mono", monospace' }}>{generateDeleteSQL("T_BOOK_INFO", `BOOKID = ${deleteConfirm}`)}</pre>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-lg text-sm border transition-all hover:bg-slate-100" style={{ borderColor: "rgba(0,0,0,0.1)", color: "#64748B" }}>取消</button>
                  <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border" style={{ backgroundColor: "rgba(248,113,113,0.15)", borderColor: "rgba(248,113,113,0.3)", color: "#F87171" }}>确认删除</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* 分类管理头部 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-mono mt-0.5" style={{ color: "#64748B" }}>
                <Database size={10} className="inline mr-1" />T_BOOK_TYPE · PK: SYS_C0011121 · Trigger: t_book_type_trig
              </p>
            </div>
            {isAdmin && (
              <button onClick={openAddType} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border" style={{ backgroundColor: "rgba(34,211,238,0.15)", borderColor: "rgba(34,211,238,0.3)", color: "#22D3EE" }}>
                <Plus size={16} /> 新增分类
              </button>
            )}
          </div>

          {/* 分类表格 */}
          <div className="rounded-xl border border-slate-200 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#f1f5f9" }}>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider" style={{ color: "#64748B" }}><KeyRound size={10} className="inline mr-1" />ID</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider" style={{ color: "#64748B" }}>分类名称</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider" style={{ color: "#64748B" }}>描述</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider" style={{ color: "#64748B" }}>图书数量</th>
                    <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-wider" style={{ color: "#64748B" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {bookTypes.map((t) => {
                    const count = books.filter((b) => b.bookTypeId === t.bookTypeId).length;
                    return (
                      <tr key={t.bookTypeId} className="border-t border-slate-200 transition-colors hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: "#64748B" }}>{t.bookTypeId}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs border" style={{ backgroundColor: "rgba(34,211,238,0.05)", borderColor: "rgba(34,211,238,0.15)", color: "#22D3EE" }}>{t.bookTypeName}</span></td>
                        <td className="px-4 py-3 text-sm" style={{ color: "#475569" }}>{t.bookTypeDesc}</td>
                        <td className="px-4 py-3 font-mono text-sm" style={{ color: "#0f172a" }}>{count} 本</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditType(t)} className="p-1.5 rounded-md transition-all hover:bg-slate-100" style={{ color: "#64748B" }}><Pencil size={14} /></button>
                            <button onClick={() => setDeleteTypeConfirm(t.bookTypeId)} className="p-1.5 rounded-md transition-all hover:bg-red-500/10" style={{ color: "#64748B" }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 分类表单弹窗 */}
          {showTypeForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={() => setShowTypeForm(false)}>
              <div className="rounded-2xl border border-slate-200 overflow-hidden max-w-md w-full p-6" style={{ backgroundColor: "#ffffff" }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold" style={{ color: "#0f172a" }}>{editingType ? "编辑分类" : "新增分类"}</h3>
                  <button onClick={() => setShowTypeForm(false)} className="p-1.5 rounded-lg transition-colors hover:bg-slate-100" style={{ color: "#64748B" }}><X size={18} /></button>
                </div>
                {typeFormError && <div className="flex items-center gap-2 p-3 rounded-lg text-sm mb-4" style={{ backgroundColor: "rgba(248,113,113,0.1)", color: "#F87171", border: "1px solid rgba(248,113,113,0.2)" }}><AlertCircle size={14} />{typeFormError}</div>}
                <div className="space-y-4">
                  <div><label className="flex items-center gap-1.5 text-sm mb-2" style={{ color: "#475569" }}><Tag size={14} />分类名称</label><input type="text" value={typeForm.bookTypeName || ""} onChange={(e) => setTypeForm({ ...typeForm, bookTypeName: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none" style={{ backgroundColor: "#f8fafc", borderColor: "rgba(0,0,0,0.08)", color: "#0f172a" }} /></div>
                  <div><label className="flex items-center gap-1.5 text-sm mb-2" style={{ color: "#475569" }}><FileText size={14} />描述</label><input type="text" value={typeForm.bookTypeDesc || ""} onChange={(e) => setTypeForm({ ...typeForm, bookTypeDesc: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none" style={{ backgroundColor: "#f8fafc", borderColor: "rgba(0,0,0,0.08)", color: "#0f172a" }} /></div>
                  <div className="p-3 rounded-lg border border-slate-200" style={{ backgroundColor: "#f1f5f9" }}>
                    <div className="text-[10px] font-mono mb-1" style={{ color: editingType ? "#FBBF24" : "#4ADE80" }}>{editingType ? "UPDATE SQL 预览" : "INSERT SQL 预览"}</div>
                    <pre className="text-[10px] overflow-x-auto" style={{ color: "#64748B", fontFamily: '"JetBrains Mono", monospace' }}>
                      <code>{editingType ? generateUpdateSQL("T_BOOK_TYPE", `BOOKTYPENAME='${typeForm.bookTypeName}'`, `BOOKTYPEID=${editingType.bookTypeId}`) : generateInsertSQL("T_BOOK_TYPE", ["BOOKTYPEID","BOOKTYPENAME","BOOKTYPEDESC"], ["seq.NEXTVAL", typeForm.bookTypeName || "null", typeForm.bookTypeDesc || "null"])}</code>
                    </pre>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowTypeForm(false)} className="flex-1 py-2.5 rounded-lg text-sm border transition-all hover:bg-slate-100" style={{ borderColor: "rgba(0,0,0,0.1)", color: "#64748B" }}>取消</button>
                    <button onClick={handleSaveType} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all border" style={{ backgroundColor: "rgba(34,211,238,0.15)", borderColor: "rgba(34,211,238,0.3)", color: "#22D3EE" }}><Save size={14} />{editingType ? "保存修改" : "添加分类"}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 删除分类确认 */}
          {deleteTypeConfirm !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={() => setDeleteTypeConfirm(null)}>
              <div className="rounded-2xl border border-slate-200 overflow-hidden max-w-sm w-full p-6" style={{ backgroundColor: "#ffffff" }} onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(248,113,113,0.1)" }}><Trash2 size={24} style={{ color: "#F87171" }} /></div>
                <h3 className="text-lg font-semibold text-center mb-2" style={{ color: "#0f172a" }}>确认删除分类</h3>
                <pre className="text-xs p-2 rounded mb-4 overflow-x-auto" style={{ backgroundColor: "#f1f5f9", color: "#64748B", fontFamily: '"JetBrains Mono", monospace' }}>{generateDeleteSQL("T_BOOK_TYPE", `BOOKTYPEID = ${deleteTypeConfirm}`)}</pre>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteTypeConfirm(null)} className="flex-1 py-2.5 rounded-lg text-sm border transition-all hover:bg-slate-100" style={{ borderColor: "rgba(0,0,0,0.1)", color: "#64748B" }}>取消</button>
                  <button onClick={() => handleDeleteType(deleteTypeConfirm)} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border" style={{ backgroundColor: "rgba(248,113,113,0.15)", borderColor: "rgba(248,113,113,0.3)", color: "#F87171" }}>确认删除</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
