import { useState, useEffect, useRef } from "react";
import { loadUsers, saveUsers, encodePassword } from "@/data/books";
import type { UserData } from "@/types";
import { useAudit, generateSelectSQL, generateInsertSQL, generateUpdateSQL, generateDeleteSQL } from "@/contexts/AuditContext";
import {
  Users, Shield, User, KeyRound, Plus, Pencil, Trash2, X, Save,
  AlertCircle, Search, Database, PlayCircle, Lock,
} from "lucide-react";

interface UserManagementProps { currentUser: { userName: string; isAdmin: number }; }

function getNextUserId(list: UserData[]) {
  return list.reduce((max, u) => Math.max(max, u.userId), 0) + 1;
}

export default function UserManagement({ currentUser }: UserManagementProps) {
  const [userList, setUserList] = useState<UserData[]>(() => loadUsers());
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const { addEntry } = useAudit();

  const [form, setForm] = useState<Partial<UserData>>({ userName: "", userPassword: "", isAdmin: 0 });

  const filtered = userList.filter((u) => !search || u.userName.toLowerCase().includes(search.toLowerCase()));

  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    addEntry({
      operation: "查询用户列表 (DBA_USERS)",
      sql: `SELECT USERID, USERNAME, ISADMIN FROM "SYSTEM"."T_USER" ORDER BY USERID`,
      type: "SELECT",
      tableName: "T_USER",
      duration: 10,
      rowsAffected: userList.length,
      plan: "INDEX FAST FULL SCAN | SYS_C0011108 (PK) | Cost: 1",
    });
  }, [addEntry, userList.length]);

  // 用户列表变更时持久化
  useEffect(() => {
    saveUsers(userList);
  }, [userList]);

  const resetForm = () => { setForm({ userName: "", userPassword: "", isAdmin: 0 }); setFormError(""); setEditingUser(null); };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
    addEntry({
      operation: "获取新用户ID (Sequence)",
      sql: `SELECT seq_t_user.NEXTVAL AS new_userid FROM DUAL`,
      type: "SELECT",
      tableName: "DUAL",
      duration: 4,
      rowsAffected: 1,
    });
  };

  const openEdit = (u: UserData) => {
    setEditingUser(u);
    setForm({ ...u });
    setFormError("");
    setShowForm(true);
    addEntry({
      operation: `查询用户详情 (PK索引)`,
      sql: generateSelectSQL("T_USER", ["*"], `USERID = ${u.userId}`),
      type: "SELECT",
      tableName: "T_USER",
      duration: 6,
      rowsAffected: 1,
      plan: `INDEX UNIQUE SCAN | SYS_C0011108 | USERID = ${u.userId} | Cost: 1`,
    });
  };

  const handleSave = () => {
    if (!form.userName?.trim()) { setFormError("请输入用户名"); return; }
    if (!form.userPassword?.trim()) { setFormError("请输入密码"); return; }

    if (editingUser) {
      addEntry({
        operation: "UPDATE: 修改用户信息",
        sql: generateUpdateSQL("T_USER", `USERNAME = '${form.userName}', USERPASSWORD = '***', ISADMIN = ${form.isAdmin}`, `USERID = ${editingUser.userId}`),
        type: "UPDATE",
        tableName: "T_USER",
        duration: 12,
        rowsAffected: 1,
        plan: `INDEX UNIQUE SCAN | SYS_C0011108 | Cost: 1`,
      });
      // CHECK约束验证
      addEntry({
        operation: "CHECK约束验证 (SYS_C0011105-1107)",
        sql: `ALTER TABLE "T_USER" ADD CONSTRAINT "SYS_C0011105" CHECK ("USERNAME" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE`,
        type: "DDL",
        tableName: "T_USER",
        duration: 3,
        rowsAffected: 0,
      });
      setUserList((prev) => prev.map((u) => u.userId === editingUser.userId ? { ...u, userName: form.userName!, userPassword: encodePassword(form.userPassword!), isAdmin: form.isAdmin! } : u));
    } else {
      if (userList.some((u) => u.userName === form.userName)) { setFormError("用户名已存在"); return; }
      const newId = getNextUserId(userList);
      // 触发器审计
      addEntry({
        operation: "触发器 t_user_trig 执行 (BEFORE INSERT)",
        sql: `TRIGGER "t_user_trig"\n  BEFORE INSERT ON T_USER\n  FOR EACH ROW\nBEGIN\n  SELECT seq_t_user.NEXTVAL INTO :NEW.USERID FROM DUAL;\n  -- 序列自动分配 ID: ${newId}\nEND;`,
        type: "TRIGGER",
        tableName: "T_USER",
        duration: 3,
        rowsAffected: 0,
      });
      addEntry({
        operation: "INSERT: 新增用户",
        sql: generateInsertSQL("T_USER", ["USERID", "USERNAME", "USERPASSWORD", "ISADMIN"], [newId, form.userName!, form.userPassword!, form.isAdmin || 0]),
        type: "INSERT",
        tableName: "T_USER",
        duration: 18,
        rowsAffected: 1,
      });
      // 大对象CLOB审计 (如果密码很长)
      if ((form.userPassword?.length || 0) > 0) {
        addEntry({
          operation: "密码存储 (RAW TO Varchar2转换)",
          sql: `-- 密码字段使用 VARCHAR2(254) 存储\n-- Oracle 可选方案: DBMS_CRYPTO.HASH 加密存储`,
          type: "PLSQL",
          tableName: "T_USER",
          duration: 5,
          rowsAffected: 0,
        });
      }
      setUserList((prev) => [...prev, { userId: newId, userName: form.userName!, userPassword: encodePassword(form.userPassword!), isAdmin: form.isAdmin || 0 }]);
    }
    setShowForm(false);
    resetForm();
  };

  const handleDelete = (userId: number) => {
    // 检查外键引用
    addEntry({
      operation: "DELETE前: 检查外键引用 (T_BORROW)",
      sql: `SELECT COUNT(*) FROM "SYSTEM"."T_BORROW" WHERE USERID = ${userId}`,
      type: "SELECT",
      tableName: "T_BORROW",
      duration: 7,
      rowsAffected: 1,
      plan: "INDEX RANGE SCAN | FK_BORROW_USER | Cost: 1",
    });
    addEntry({
      operation: `DELETE: 删除用户`,
      sql: generateDeleteSQL("T_USER", `USERID = ${userId}`),
      type: "DELETE",
      tableName: "T_USER",
      duration: 15,
      rowsAffected: 1,
      plan: `INDEX UNIQUE SCAN | SYS_C0011108 | Cost: 1`,
    });
    setUserList((prev) => prev.filter((u) => u.userId !== userId));
    setDeleteConfirm(null);
  };

  const adminCount = userList.filter((u) => u.isAdmin === 1).length;
  const normalCount = userList.filter((u) => u.isAdmin === 0).length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>用户管理</h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: "#64748B" }}>
            <Database size={10} className="inline mr-1" />T_USER · PK: SYS_C0011108 · Trigger: t_user_trig · Seq: seq_t_user
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border" style={{ backgroundColor: "rgba(192,132,252,0.15)", borderColor: "rgba(192,132,252,0.3)", color: "#C084FC" }}>
          <Plus size={16} />新增用户
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: "管理员", count: adminCount, icon: Shield, color: "#22D3EE", sql: `SELECT COUNT(*) FROM T_USER WHERE ISADMIN = 1` },
          { label: "普通用户", count: normalCount, icon: User, color: "#C084FC", sql: `SELECT COUNT(*) FROM T_USER WHERE ISADMIN = 0` },
          { label: "用户总数", count: userList.length, icon: Users, color: "#FBBF24", sql: `SELECT COUNT(*) FROM T_USER` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 p-5" style={{ backgroundColor: "#ffffff" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}10` }}><s.icon size={18} style={{ color: s.color }} /></div>
              <div>
                <div className="text-2xl font-bold font-mono" style={{ color: "#0f172a" }}>{s.count}</div>
                <div className="text-xs" style={{ color: "#64748B" }}>{s.label}</div>
              </div>
            </div>
            <pre className="text-[9px]" style={{ color: "#cbd5e1", fontFamily: '"JetBrains Mono", monospace' }}>{s.sql}</pre>
          </div>
        ))}
      </div>

      {/* 触发器说明 */}
      <div className="mb-6 p-3 rounded-lg border border-purple-500/10 flex items-start gap-3" style={{ backgroundColor: "rgba(192,132,252,0.03)" }}>
        <PlayCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#C084FC" }} />
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: "#C084FC" }}>触发器: t_user_trig (BEFORE INSERT)</div>
          <pre className="text-[10px]" style={{ color: "#64748B", fontFamily: '"JetBrains Mono", monospace' }}>
            <code>BEGIN SELECT seq_t_user.NEXTVAL INTO :NEW.USERID FROM DUAL; END;\n-- 序列 seq_t_user 自动为 USERID 生成唯一递增值</code>
          </pre>
        </div>
      </div>

      {/* 搜索 */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索用户名..." className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border outline-none" style={{ backgroundColor: "#f8fafc", borderColor: "rgba(0,0,0,0.08)", color: "#0f172a" }} />
      </div>

      {/* 表格 */}
      <div className="rounded-xl border border-slate-200 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9" }}>
                <th className="text-left px-4 py-3 text-xs font-mono" style={{ color: "#64748B" }}>USERID (PK)</th>
                <th className="text-left px-4 py-3 text-xs font-mono" style={{ color: "#64748B" }}>USERNAME</th>
                <th className="text-left px-4 py-3 text-xs font-mono" style={{ color: "#64748B" }}>ISADMIN</th>
                <th className="text-left px-4 py-3 text-xs font-mono" style={{ color: "#64748B" }}>PASSWORD</th>
                <th className="text-right px-4 py-3 text-xs font-mono" style={{ color: "#64748B" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.userId} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#64748B" }}>{u.userId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: u.isAdmin ? "rgba(34,211,238,0.15)" : "rgba(192,132,252,0.15)", color: u.isAdmin ? "#22D3EE" : "#C084FC" }}>{u.userName.charAt(0).toUpperCase()}</div>
                      <span className="text-sm font-medium" style={{ color: "#0f172a" }}>{u.userName}</span>
                      {currentUser.userName === u.userName && <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: "rgba(74,222,128,0.1)", color: "#4ADE80" }}>我</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs w-fit" style={{ backgroundColor: u.isAdmin ? "rgba(34,211,238,0.1)" : "rgba(192,132,252,0.1)", color: u.isAdmin ? "#22D3EE" : "#C084FC" }}>{u.isAdmin ? <Shield size={10} /> : <User size={10} />}{u.isAdmin ? "管理员" : "普通用户"}</span></td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#64748B" }}><div className="flex items-center gap-1"><Lock size={10} />{u.userPassword}</div></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-md transition-all hover:bg-slate-100" style={{ color: "#64748B" }}><Pencil size={14} /></button>
                      {currentUser.userName !== u.userName && <button onClick={() => setDeleteConfirm(u.userId)} className="p-1.5 rounded-md transition-all hover:bg-red-500/10" style={{ color: "#64748B" }}><Trash2 size={14} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="py-12 text-center"><Users size={32} className="mx-auto mb-3" style={{ color: "#cbd5e1" }} /><p style={{ color: "#64748B" }}>没有找到匹配的用户</p></div>}
      </div>

      {/* 弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={() => setShowForm(false)}>
          <div className="rounded-2xl border border-slate-200 overflow-hidden max-w-md w-full p-6" style={{ backgroundColor: "#ffffff" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ color: "#0f172a" }}>{editingUser ? "编辑用户" : "新增用户"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg transition-colors hover:bg-slate-100" style={{ color: "#64748B" }}><X size={18} /></button>
            </div>
            {formError && <div className="flex items-center gap-2 p-3 rounded-lg text-sm mb-4" style={{ backgroundColor: "rgba(248,113,113,0.1)", color: "#F87171", border: "1px solid rgba(248,113,113,0.2)" }}><AlertCircle size={14} />{formError}</div>}
            <div className="space-y-4">
              <div><label className="flex items-center gap-1.5 text-sm mb-2" style={{ color: "#475569" }}><User size={14} />用户名</label><input type="text" value={form.userName || ""} onChange={(e) => setForm({ ...form, userName: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none" style={{ backgroundColor: "#f8fafc", borderColor: "rgba(0,0,0,0.08)", color: "#0f172a" }} /></div>
              <div><label className="flex items-center gap-1.5 text-sm mb-2" style={{ color: "#475569" }}><KeyRound size={14} />密码</label><input type="text" value={form.userPassword || ""} onChange={(e) => setForm({ ...form, userPassword: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none" style={{ backgroundColor: "#f8fafc", borderColor: "rgba(0,0,0,0.08)", color: "#0f172a" }} /></div>
              <div><label className="text-sm mb-2 block" style={{ color: "#475569" }}>角色</label><div className="flex gap-3">
                <button onClick={() => setForm({ ...form, isAdmin: 0 })} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm border transition-all" style={{ backgroundColor: form.isAdmin === 0 ? "rgba(192,132,252,0.1)" : "#f8fafc", borderColor: form.isAdmin === 0 ? "rgba(192,132,252,0.3)" : "rgba(0,0,0,0.08)", color: form.isAdmin === 0 ? "#C084FC" : "#64748B" }}><User size={14} />普通用户</button>
                <button onClick={() => setForm({ ...form, isAdmin: 1 })} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm border transition-all" style={{ backgroundColor: form.isAdmin === 1 ? "rgba(34,211,238,0.1)" : "#f8fafc", borderColor: form.isAdmin === 1 ? "rgba(34,211,238,0.3)" : "rgba(0,0,0,0.08)", color: form.isAdmin === 1 ? "#22D3EE" : "#64748B" }}><Shield size={14} />管理员</button>
              </div></div>
              {/* SQL预览 */}
              <div className="p-3 rounded-lg border border-slate-200" style={{ backgroundColor: "#f1f5f9" }}>
                <div className="text-[10px] font-mono mb-1" style={{ color: editingUser ? "#FBBF24" : "#4ADE80" }}>{editingUser ? "UPDATE SQL 预览" : "INSERT SQL 预览 (触发器 + 序列)"}</div>
                <pre className="text-[10px] overflow-x-auto" style={{ color: "#64748B", fontFamily: '"JetBrains Mono", monospace' }}>
                  <code>{editingUser ? generateUpdateSQL("T_USER", `USERNAME='${form.userName}', ISADMIN=${form.isAdmin}`, `USERID=${editingUser.userId}`) : generateInsertSQL("T_USER", ["USERID","USERNAME","USERPASSWORD","ISADMIN"], ["seq.NEXTVAL", form.userName || "null", "'***'", form.isAdmin || 0])}</code>
                </pre>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg text-sm border transition-all hover:bg-slate-100" style={{ borderColor: "rgba(0,0,0,0.1)", color: "#64748B" }}>取消</button>
                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all border" style={{ backgroundColor: "rgba(192,132,252,0.15)", borderColor: "rgba(192,132,252,0.3)", color: "#C084FC" }}><Save size={14} />{editingUser ? "保存修改" : "添加用户"}</button>
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
            <pre className="text-xs p-2 rounded mb-4 overflow-x-auto" style={{ backgroundColor: "#f1f5f9", color: "#64748B", fontFamily: '"JetBrains Mono", monospace' }}>{generateDeleteSQL("T_USER", `USERID = ${deleteConfirm}`)}</pre>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-lg text-sm border transition-all hover:bg-slate-100" style={{ borderColor: "rgba(0,0,0,0.1)", color: "#64748B" }}>取消</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border" style={{ backgroundColor: "rgba(248,113,113,0.15)", borderColor: "rgba(248,113,113,0.3)", color: "#F87171" }}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
