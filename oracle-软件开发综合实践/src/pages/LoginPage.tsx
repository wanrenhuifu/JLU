import { useState, useEffect, useRef } from "react";
import { users, verifyPassword } from "@/data/books";
import {
  Shield,
  User,
  Eye,
  EyeOff,
  LogIn,
  Database,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Server,
  Lock,
} from "lucide-react";

interface LoginPageProps {
  onLogin: (user: { userName: string; isAdmin: number; userId: number }) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [loginType, setLoginType] = useState<"admin" | "user">("user");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState<
    { x: number; y: number; size: number; speed: number; opacity: number }[]
  >([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 预设快捷登录
  const quickLogins = [
    { label: "管理员", userName: "admin", password: "admin", type: "admin" as const },
    { label: "普通用户", userName: "李明", password: "123456", type: "user" as const },
  ];

  // Canvas粒子动画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const p: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      p.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < p.length; i++) {
        const dot = p[i];
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0) dot.x = w;
        if (dot.x > w) dot.x = 0;
        if (dot.y < 0) dot.y = h;
        if (dot.y > h) dot.y = 0;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 100, 120, ${dot.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < p.length; j++) {
          const q = p[j];
          const dx = dot.x - q.x;
          const dy = dot.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(100, 100, 120, ${0.04 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 浮动粒子（纯CSS）
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 15 + 10,
      opacity: Math.random() * 0.3 + 0.1,
    }));
    setParticles(newParticles);
  }, []);

  const handleLogin = () => {
    setError("");
    if (!userName.trim()) {
      setError("请输入用户名");
      return;
    }
    if (!password.trim()) {
      setError("请输入密码");
      return;
    }

    setIsLoading(true);

    // 模拟网络延迟
    setTimeout(() => {
      const foundUser = users.find(
        (u) => u.userName === userName && verifyPassword(password, u.userPassword)
      );

      if (!foundUser) {
        setError("用户名或密码错误");
        setIsLoading(false);
        return;
      }

      if (loginType === "admin" && foundUser.isAdmin !== 1) {
        setError("该用户不是管理员，请使用普通用户登录");
        setIsLoading(false);
        return;
      }

      if (loginType === "user" && foundUser.isAdmin === 1) {
        setError("管理员账号请使用管理员登录入口");
        setIsLoading(false);
        return;
      }

      onLogin({
        userName: foundUser.userName,
        isAdmin: foundUser.isAdmin,
        userId: foundUser.userId,
      });
    }, 800);
  };

  const handleQuickLogin = (ql: (typeof quickLogins)[0]) => {
    setLoginType(ql.type);
    setUserName(ql.userName);
    setPassword(ql.password);
    setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#f8fafc" }}
    >
      {/* Canvas 粒子背景 */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 浮动粒子 */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: "#C084FC",
            opacity: p.opacity,
            animation: `float ${p.speed}s ease-in-out infinite alternate`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}



      {/* 左侧装饰区域 */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative items-center justify-center">
        <div className="relative z-10 text-center px-12">
          {/* Oracle DB 图标 */}
          <div className="mb-8 flex justify-center">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: "rgba(192,132,252,0.1)",
                border: "1px solid rgba(192,132,252,0.2)",
                animation: "pulse-glow 3s ease-in-out infinite",
              }}
            >
              <Database size={48} style={{ color: "#C084FC" }} />
            </div>
          </div>

          <h1
            className="text-4xl font-bold mb-4 tracking-tight"
            style={{ color: "#0f172a" }}
          >
            Oracle{" "}
            <span style={{ color: "#C084FC" }}>图书管理系统</span>
          </h1>
          <p className="text-base leading-relaxed max-w-md mx-auto" style={{ color: "#64748B" }}>
            基于 Oracle 11g 数据库的企业级图书管理解决方案
            <br />
            体验完整的 Oracle 数据库特性
          </p>

          {/* 特性标签 */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["数据表", "表空间", "主键", "外键", "触发器", "存储过程"].map(
              (tag, i) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-xs font-mono border animate-slide-up"
                  style={{
                    backgroundColor: "#f8fafc",
                    borderColor: "rgba(0,0,0,0.08)",
                    color: "#475569",
                    animationDelay: `${0.3 + i * 0.1}s`,
                    opacity: 0,
                  }}
                >
                  {tag}
                </span>
              )
            )}
          </div>

          {/* 数据指标 */}
          <div
            className="grid grid-cols-3 gap-4 mt-10 max-w-sm mx-auto animate-slide-up"
            style={{ animationDelay: "0.8s", opacity: 0 }}
          >
            <div
              className="p-3 rounded-lg border border-slate-200"
              style={{ backgroundColor: "#f1f5f9" }}
            >
              <div className="text-lg font-mono font-semibold" style={{ color: "#C084FC" }}>
                4
              </div>
              <div className="text-xs" style={{ color: "#64748B" }}>
                数据表
              </div>
            </div>
            <div
              className="p-3 rounded-lg border border-slate-200"
              style={{ backgroundColor: "#f1f5f9" }}
            >
              <div className="text-lg font-mono font-semibold" style={{ color: "#22D3EE" }}>
                11g
              </div>
              <div className="text-xs" style={{ color: "#64748B" }}>
                数据库版本
              </div>
            </div>
            <div
              className="p-3 rounded-lg border border-slate-200"
              style={{ backgroundColor: "#f1f5f9" }}
            >
              <div className="text-lg font-mono font-semibold" style={{ color: "#F472B6" }}>
                6
              </div>
              <div className="text-xs" style={{ color: "#64748B" }}>
                图书分类
              </div>
            </div>
          </div>
        </div>

        {/* 左侧渐变遮罩 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(248,250,252,0.6) 100%)",
          }}
        />
      </div>

      {/* 右侧登录表单 */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center px-4 sm:px-8 relative z-10">
        <div
          className="w-full max-w-md rounded-2xl border border-slate-200 p-6 sm:p-8 animate-slide-up"
          style={{
            backgroundColor: "#ffffff",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* 移动端标题 */}
          <div className="lg:hidden text-center mb-6">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{
                backgroundColor: "rgba(192,132,252,0.1)",
                border: "1px solid rgba(192,132,252,0.2)",
              }}
            >
              <Database size={32} style={{ color: "#C084FC" }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
              Oracle 图书管理系统
            </h1>
          </div>

          {/* 登录类型切换 */}
          <div className="flex gap-2 mb-6 p-1 rounded-lg" style={{ backgroundColor: "#f1f5f9" }}>
            <button
              onClick={() => {
                setLoginType("user");
                setError("");
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor:
                  loginType === "user" ? "rgba(192,132,252,0.15)" : "transparent",
                color: loginType === "user" ? "#C084FC" : "#64748B",
                border:
                  loginType === "user"
                    ? "1px solid rgba(192,132,252,0.3)"
                    : "1px solid transparent",
              }}
            >
              <User size={16} />
              普通用户
            </button>
            <button
              onClick={() => {
                setLoginType("admin");
                setError("");
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor:
                  loginType === "admin" ? "rgba(34,211,238,0.15)" : "transparent",
                color: loginType === "admin" ? "#22D3EE" : "#64748B",
                border:
                  loginType === "admin"
                    ? "1px solid rgba(34,211,238,0.3)"
                    : "1px solid transparent",
              }}
            >
              <Shield size={16} />
              管理员
            </button>
          </div>

          {/* 登录标题 */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1" style={{ color: "#0f172a" }}>
              {loginType === "admin" ? "管理员登录" : "用户登录"}
            </h2>
            <p className="text-sm" style={{ color: "#64748B" }}>
              {loginType === "admin"
                ? "请输入管理员账号和密码"
                : "请输入用户名和密码"}
            </p>
          </div>

          {/* 快捷登录 */}
          <div className="flex gap-2 mb-5">
            {quickLogins
              .filter((ql) => ql.type === loginType)
              .map((ql) => (
                <button
                  key={ql.label}
                  onClick={() => handleQuickLogin(ql)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all hover:border-purple-500/30"
                  style={{
                    backgroundColor: "rgba(192,132,252,0.05)",
                    borderColor: "rgba(0,0,0,0.08)",
                    color: "#475569",
                  }}
                >
                  <KeyRound size={10} />
                  {ql.label}: {ql.userName}
                </button>
              ))}
          </div>

          {/* 用户名 */}
          <div className="mb-4">
            <label
              className="flex items-center gap-1.5 text-sm font-medium mb-2"
              style={{ color: "#475569" }}
            >
              <User size={14} />
              用户名
            </label>
            <div className="relative">
              <input
                type="text"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder={loginType === "admin" ? "admin" : "李明"}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all border"
                style={{
                  backgroundColor: "#f8fafc",
                  borderColor: error ? "rgba(248,113,113,0.4)" : "rgba(0,0,0,0.08)",
                  color: "#0f172a",
                }}
                onFocus={(e) => {
                  if (!error) e.currentTarget.style.borderColor = "rgba(192,132,252,0.4)";
                }}
                onBlur={(e) => {
                  if (!error) e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
                }}
              />
            </div>
          </div>

          {/* 密码 */}
          <div className="mb-5">
            <label
              className="flex items-center gap-1.5 text-sm font-medium mb-2"
              style={{ color: "#475569" }}
            >
              <Lock size={14} />
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="••••••"
                className="w-full px-4 py-3 pr-12 rounded-lg text-sm outline-none transition-all border"
                style={{
                  backgroundColor: "#f8fafc",
                  borderColor: error ? "rgba(248,113,113,0.4)" : "rgba(0,0,0,0.08)",
                  color: "#0f172a",
                }}
                onFocus={(e) => {
                  if (!error) e.currentTarget.style.borderColor = "rgba(192,132,252,0.4)";
                }}
                onBlur={(e) => {
                  if (!error) e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
                }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors hover:bg-slate-100"
                style={{ color: "#64748B" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm animate-slide-up"
              style={{
                backgroundColor: "rgba(248,113,113,0.1)",
                color: "#F87171",
                border: "1px solid rgba(248,113,113,0.2)",
              }}
            >
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* 登录按钮 */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border"
            style={{
              backgroundColor: isLoading
                ? "rgba(192,132,252,0.3)"
                : "rgba(192,132,252,0.15)",
              color: "#C084FC",
              borderColor: "rgba(192,132,252,0.3)",
              cursor: isLoading ? "wait" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "rgba(192,132,252,0.25)";
                e.currentTarget.style.borderColor = "rgba(192,132,252,0.5)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(192,132,252,0.15)";
              e.currentTarget.style.borderColor = "rgba(192,132,252,0.3)";
            }}
          >
            {isLoading ? (
              <>
                <Server size={16} className="animate-pulse" />
                连接 Oracle 数据库...
              </>
            ) : (
              <>
                <LogIn size={16} />
                登 录
                <ArrowRight size={14} />
              </>
            )}
          </button>

          {/* 提示信息 */}
          <div
            className="mt-6 pt-5 border-t border-slate-200 text-center"
            style={{ color: "#64748B" }}
          >
            <p className="text-xs">
              Oracle Database 11g Enterprise Edition
            </p>
            <p className="text-xs mt-1 font-mono">
              SYSTEM@192.168.199.183:1521
            </p>
          </div>
        </div>
      </div>

      {/* 全局渐变 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(192,132,252,0.06) 0%, transparent 50%)",
        }}
      />
    </div>
  );
}
