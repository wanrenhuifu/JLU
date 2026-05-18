import {
  Home,
  LayoutDashboard,
  BookOpen,
  ArrowLeftRight,
  Users,
  Database,
  TableProperties,
  LogOut,
  Shield,
  User,
  Menu,
  X,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { useState } from "react";

interface LoggedUser {
  userName: string;
  isAdmin: number;
  userId: number;
}

interface NavbarProps {
  user: LoggedUser;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdmin: boolean;
  onResetData?: () => void;
}

export default function Navbar({ user, onLogout, currentPage, onNavigate, isAdmin, onResetData }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: "home", label: "首页", icon: Home, color: "#C084FC" },
    { id: "dashboard", label: "控制台", icon: LayoutDashboard, color: "#A78BFA" },
    { id: "books", label: "图书管理", icon: BookOpen, color: "#22D3EE" },
    { id: "borrows", label: "借阅管理", icon: ArrowLeftRight, color: "#F472B6" },
    ...(isAdmin ? [{ id: "users", label: "用户管理", icon: Users, color: "#FBBF24" }] : []),
    { id: "oracle", label: "Oracle特性", icon: Database, color: "#4ADE80" },
    { id: "schema", label: "表结构", icon: TableProperties, color: "#A78BFA" },
    { id: "sql", label: "SQL工作台", icon: Terminal, color: "#FB923C" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200"
      style={{ backdropFilter: "blur(20px)", backgroundColor: "rgba(255,255,255,0.85)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            <img src="/images/oracle-db-icon.png" alt="Oracle" className="w-7 h-7" />
            <span className="text-sm font-semibold tracking-tight hidden sm:block" style={{ color: "#0f172a" }}>
              Oracle图书管理
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border"
                  style={{
                    backgroundColor: isActive ? `${item.color}12` : "transparent",
                    borderColor: isActive ? `${item.color}30` : "transparent",
                    color: isActive ? item.color : "#64748B",
                  }}
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border"
              style={{
                backgroundColor: isAdmin ? "rgba(34,211,238,0.06)" : "rgba(192,132,252,0.06)",
                borderColor: isAdmin ? "rgba(34,211,238,0.15)" : "rgba(192,132,252,0.15)",
              }}
            >
              {isAdmin ? <Shield size={12} style={{ color: "#22D3EE" }} /> : <User size={12} style={{ color: "#C084FC" }} />}
              <span className="text-xs font-mono" style={{ color: isAdmin ? "#22D3EE" : "#C084FC" }}>
                {user.userName}
              </span>
            </div>
            {onResetData && (
              <button
                onClick={onResetData}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:bg-slate-100"
                style={{ color: "#64748B" }}
                title="重置演示数据"
              >
                <RotateCcw size={14} />
              </button>
            )}
            <button
              onClick={onLogout}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:bg-slate-100"
              style={{ color: "#64748B" }}
              title="退出登录"
            >
              <LogOut size={14} />
            </button>
            <button
              className="lg:hidden p-2 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ color: "#64748B" }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t border-slate-200 px-4 py-3 space-y-1"
          style={{ backgroundColor: "#ffffff" }}
        >
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm transition-all border"
                style={{
                  backgroundColor: isActive ? `${item.color}10` : "transparent",
                  borderColor: isActive ? `${item.color}25` : "transparent",
                  color: isActive ? item.color : "#64748B",
                }}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 px-4 py-2">
              {isAdmin ? <Shield size={14} style={{ color: "#22D3EE" }} /> : <User size={14} style={{ color: "#C084FC" }} />}
              <span className="text-sm" style={{ color: "#475569" }}>
                {user.userName} ({isAdmin ? "管理员" : "用户"})
              </span>
            </div>
            {onResetData && (
              <button
                onClick={onResetData}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm"
                style={{ color: "#64748B" }}
              >
                <RotateCcw size={14} />
                重置数据
              </button>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm"
              style={{ color: "#64748B" }}
            >
              <LogOut size={14} />
              退出
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
