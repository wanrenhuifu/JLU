import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

import { AuditProvider } from "@/contexts/AuditContext";
import LoginPage from "@/pages/LoginPage";
import Navbar from "@/components/Navbar";
import Dashboard from "@/pages/Dashboard";
import BookManagement from "@/modules/books/BookManagement";
import BorrowManagement from "@/modules/borrows/BorrowManagement";
import UserManagement from "@/modules/users/UserManagement";
import OracleFeatures from "@/sections/OracleFeatures";
import SchemaCard from "@/components/SchemaCard";
import SQLWorkbench from "@/pages/SQLWorkbench";
import HeroSection from "@/sections/HeroSection";
import ParticleBackground from "@/components/ParticleBackground";
import AuditPanel from "@/components/AuditPanel";
import SQLToast, { AuditButton } from "@/components/SQLToast";
import { loadBooks, saveBooks, loadBorrows, saveBorrows, loadUsers, resetAllData, loadBookTypes, saveBookTypes } from "@/data/books";
import type { Book, BorrowRecord, LoggedUser, BookType } from "@/types";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<LoggedUser | null>(() => {
    const saved = localStorage.getItem("oracle_bookmanager_user");
    if (saved) { try { return JSON.parse(saved) as LoggedUser; } catch { localStorage.removeItem("oracle_bookmanager_user"); } }
    return null;
  });

  // 从 URL 路径解析当前页面
  const page = location.pathname.replace(/^\//, "") || "home";

  const [booksState, setBooksState] = useState<Book[]>(() => loadBooks());
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>(() => loadBorrows());
  const [bookTypesState, setBookTypesState] = useState<BookType[]>(() => loadBookTypes());

  // 数据变更时持久化到 localStorage
  useEffect(() => { saveBooks(booksState); }, [booksState]);
  useEffect(() => { saveBorrows(borrowRecords); }, [borrowRecords]);
  useEffect(() => { saveBookTypes(bookTypesState); }, [bookTypesState]);

  // 计算下一个可用的 borrowId
  const getNextBorrowId = useCallback(() => {
    return borrowRecords.reduce((max, r) => Math.max(max, r.borrowId), 0) + 1;
  }, [borrowRecords]);

  const handleNavigate = useCallback((target: string) => {
    navigate("/" + target);
  }, [navigate]);

  const handleLogin = useCallback((loggedUser: LoggedUser) => {
    setUser(loggedUser);
    localStorage.setItem("oracle_bookmanager_user", JSON.stringify(loggedUser));
    navigate("/dashboard");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("oracle_bookmanager_user");
    navigate("/dashboard");
  }, [navigate]);

  const handleBorrowBook = useCallback((book: Book) => {
    if (!user) return;
    const newRecord: BorrowRecord = {
      borrowId: getNextBorrowId(),
      bookId: book.bookId,
      bookName: book.bookName,
      userName: user.userName,
      borrowDate: new Date().toISOString().split("T")[0],
      status: "active",
    };
    setBooksState((prev) => prev.map((b) => b.bookId === book.bookId ? { ...b, isBorrowed: 1 } : b));
    setBorrowRecords((prev) => [...prev, newRecord]);
  }, [user, getNextBorrowId]);

  const handleReturnBook = useCallback((borrowId: number) => {
    if (!user) return;
    const record = borrowRecords.find((r) => r.borrowId === borrowId);
    // 普通用户只能归还自己的书
    if (record && user.isAdmin === 0 && record.userName !== user.userName) return;
    if (record) {
      setBooksState((prev) => prev.map((b) => b.bookId === record.bookId ? { ...b, isBorrowed: 0 } : b));
    }
    setBorrowRecords((prev) =>
      prev.map((r) => r.borrowId === borrowId ? { ...r, status: "returned" as const, returnDate: new Date().toISOString().split("T")[0] } : r)
    );
  }, [borrowRecords, user]);

  const handleResetData = useCallback(() => {
    if (window.confirm("确定要重置所有数据吗？这将恢复为初始演示数据。")) {
      resetAllData();
      window.location.reload();
    }
  }, []);

  const isAdmin = user?.isAdmin === 1;

  // 路由权限守卫：非管理员访问管理页面时重定向
  useEffect(() => {
    if (page === "users" && !isAdmin) {
      navigate("/dashboard");
    }
  }, [page, isAdmin, navigate]);

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}>
      <ParticleBackground />
      <AuditPanel />
      <SQLToast />
      <AuditButton />
      <Navbar user={user} onLogout={handleLogout} currentPage={page} onNavigate={handleNavigate} isAdmin={isAdmin} onResetData={handleResetData} />
      <main className="pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {page === "home" && <HeroSection onNavigate={handleNavigate} />}
          {page === "dashboard" && <Dashboard user={user} onNavigate={handleNavigate} borrowRecords={borrowRecords} books={booksState} />}
          {page === "books" && <BookManagement user={user} onBorrowBook={handleBorrowBook} books={booksState} onUpdateBooks={setBooksState} bookTypes={bookTypesState} onUpdateBookTypes={setBookTypesState} />}
          {page === "borrows" && <BorrowManagement records={borrowRecords} onReturn={handleReturnBook} onBorrow={handleBorrowBook} user={user} books={booksState} />}
          {page === "users" && isAdmin && <UserManagement currentUser={user} />}
          {page === "oracle" && <OracleFeatures />}
          {page === "schema" && <SchemaCard />}
          {page === "sql" && <SQLWorkbench books={booksState} users={loadUsers()} borrows={borrowRecords} bookTypes={bookTypesState} />}
        </div>
      </main>
      <footer className="relative z-10 border-t border-slate-200 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-mono" style={{ color: "#64748B" }}>
            Oracle BookManager System · Oracle 11g · SpringBoot 2.x · 数据表 / 用户 / 表空间 / 主键 / 外键 / 索引 / 视图 / 触发器 / 存储过程 / 大对象
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuditProvider>
      <AppContent />
    </AuditProvider>
  );
}
