export interface OracleFeature {
  id: string;
  title: string;
  icon: string;
  description: string;
  codeExample: string;
  details: string[];
}

export const oracleFeatures: OracleFeature[] = [
  {
    id: "tablespace",
    title: "表空间",
    icon: "Database",
    description: "Oracle 使用表空间（Tablespace）作为逻辑存储单元，数据物理上存储在数据文件中，逻辑上组织在表空间里。",
    codeExample: `-- 创建图书管理表空间
CREATE TABLESPACE ts_bookmanager
  DATAFILE 'ts_bookmanager.dbf' SIZE 100M AUTOEXTEND ON
  NEXT 10M MAXSIZE 500M
  EXTENT MANAGEMENT LOCAL
  SEGMENT SPACE MANAGEMENT AUTO;`,
    details: [
      "SYSTEM 表空间: 存储数据字典和系统对象",
      "USER 表空间: 存储用户数据对象",
      "PCTFREE 10: 数据块预留10%空间用于更新",
      "INITRANS 1: 初始事务槽位数",
      "STORAGE 子句控制区段分配参数",
    ],
  },
  {
    id: "tables",
    title: "数据表",
    icon: "Table",
    description: "本项目包含4张核心数据表：T_USER（用户表）、T_BOOK_TYPE（图书类型表）、T_BOOK_INFO（图书信息表）、T_BORROW（借阅记录表）。",
    codeExample: `-- T_BOOK_INFO 表结构
CREATE TABLE "SYSTEM"."T_BOOK_INFO" (
  "BOOKID" NUMBER NOT NULL,
  "BOOKNAME" VARCHAR2(255 BYTE) NOT NULL,
  "BOOKAUTHOR" VARCHAR2(255 BYTE) NOT NULL,
  "BOOKPRICE" NUMBER NOT NULL,
  "BOOKTYPEID" NUMBER NOT NULL,
  "BOOKDESC" VARCHAR2(1000 BYTE) NOT NULL,
  "ISBORROWED" NUMBER NOT NULL,
  "BOOKIMG" VARCHAR2(255 BYTE) NOT NULL
);`,
    details: [
      "所有表名加 t_ 前缀（避免 Oracle 关键字冲突）",
      "使用 NUMBER 类型替代 INT（Oracle 推荐）",
      "VARCHAR2 替代 VARCHAR（Oracle 专用优化类型）",
      "Oracle 中 user 是保留字，故表名为 t_user",
      "T_BORROW 表记录借阅关联关系",
    ],
  },
  {
    id: "users",
    title: "用户",
    icon: "Users",
    description: "Oracle 具有强大的用户和权限管理系统。本项目使用 SYSTEM 用户下的 schema 组织数据对象。",
    codeExample: `-- 创建图书管理专用用户
CREATE USER bookmanager IDENTIFIED BY bookmanager123
  DEFAULT TABLESPACE ts_bookmanager
  QUOTA 100M ON ts_bookmanager;

-- 授权
GRANT CREATE SESSION TO bookmanager;
GRANT CREATE TABLE TO bookmanager;
GRANT CREATE SEQUENCE TO bookmanager;
GRANT CREATE TRIGGER TO bookmanager;`,
    details: [
      "SYSTEM: 超级管理员 Schema",
      "Schema 是用户的对象集合命名空间",
      "CONNECT 角色: 基本连接权限",
      "RESOURCE 角色: 创建数据库对象权限",
      "DBA 角色: 数据库管理员权限",
    ],
  },
  {
    id: "primarykey",
    title: "主键",
    icon: "KeyRound",
    description: "主键（Primary Key）是表中唯一标识每行记录的约束，Oracle 自动为主键创建唯一索引。",
    codeExample: `-- T_USER 表主键约束
ALTER TABLE "SYSTEM"."T_USER" 
  ADD CONSTRAINT "SYS_C0011108" 
  PRIMARY KEY ("USERID");

-- T_BOOK_TYPE 表主键
ALTER TABLE "SYSTEM"."T_BOOK_TYPE" 
  ADD CONSTRAINT "SYS_C0011121" 
  PRIMARY KEY ("BOOKTYPEID");`,
    details: [
      "SYS_C0011108: T_USER 表的 USERID 主键",
      "SYS_C0011121: T_BOOK_TYPE 表的 BOOKTYPEID 主键",
      "主键自动创建唯一索引，加速查询",
      "主键字段 NOT NULL 约束自动生效",
      "约束命名遵循 SYS_C 前缀的系统命名规则",
    ],
  },
  {
    id: "foreignkey",
    title: "外键",
    icon: "Link",
    description: "外键（Foreign Key）建立表与表之间的关联关系，保证引用完整性。",
    codeExample: `-- 图书类型外键关联
ALTER TABLE "SYSTEM"."T_BOOK_INFO"
  ADD CONSTRAINT "FK_BOOK_TYPE"
  FOREIGN KEY ("BOOKTYPEID")
  REFERENCES "SYSTEM"."T_BOOK_TYPE"("BOOKTYPEID");

-- 借阅记录外键
ALTER TABLE "SYSTEM"."T_BORROW"
  ADD CONSTRAINT "FK_BORROW_BOOK"
  FOREIGN KEY ("BOOKID")
  REFERENCES "SYSTEM"."T_BOOK_INFO"("BOOKID");`,
    details: [
      "T_BOOK_INFO.BOOKTYPEID → T_BOOK_TYPE.BOOKTYPEID",
      "T_BORROW.BOOKID → T_BOOK_INFO.BOOKID",
      "T_BORROW.USERID → T_USER.USERID",
      "外键保证数据引用完整性",
      "可配置级联删除/更新规则",
    ],
  },
  {
    id: "index",
    title: "索引",
    icon: "Search",
    description: "索引（Index）是加速数据检索的数据库对象。Oracle 自动为主键和唯一约束创建索引。",
    codeExample: `-- 创建图书名称索引
CREATE INDEX "IDX_BOOK_NAME" 
  ON "SYSTEM"."T_BOOK_INFO"("BOOKNAME");

-- 创建复合索引
CREATE INDEX "IDX_BOOK_TYPE_NAME"
  ON "SYSTEM"."T_BOOK_INFO"("BOOKTYPEID", "BOOKNAME");

-- 查看索引信息
SELECT index_name, table_name, uniqueness 
FROM user_indexes WHERE table_name = 'T_BOOK_INFO';`,
    details: [
      "B-Tree 索引: Oracle 默认索引类型",
      "主键自动创建唯一索引",
      "复合索引可加速多条件查询",
      "函数索引支持表达式查询优化",
      "过多索引会影响 DML 操作性能",
    ],
  },
  {
    id: "view",
    title: "视图",
    icon: "Eye",
    description: "视图（View）是基于 SQL 查询的虚拟表，可简化复杂查询并提供安全的数据访问控制。",
    codeExample: `-- 创建图书详情视图
CREATE VIEW "VW_BOOK_DETAILS" AS
SELECT 
  b.BOOKID, b.BOOKNAME, b.BOOKAUTHOR,
  b.BOOKPRICE, t.BOOKTYPENAME, b.BOOKDESC,
  b.ISBORROWED
FROM "T_BOOK_INFO" b
JOIN "T_BOOK_TYPE" t 
  ON b.BOOKTYPEID = t.BOOKTYPEID;

-- 创建可借阅图书视图
CREATE VIEW "VW_AVAILABLE_BOOKS" AS
SELECT * FROM "T_BOOK_INFO" WHERE ISBORROWED = 0;`,
    details: [
      "简化多表 JOIN 查询",
      "数据安全: 隐藏敏感字段",
      "逻辑独立: 隔离底层表结构变化",
      "物化视图可预计算结果加速查询",
      "INSTEAD OF 触发器实现视图 DML",
    ],
  },
  {
    id: "trigger",
    title: "触发器",
    icon: "Zap",
    description: "触发器（Trigger）是在特定数据库事件发生时自动执行的 PL/SQL 块。本项目使用触发器实现自增主键。",
    codeExample: `-- T_USER 表自增触发器
CREATE TRIGGER "SYSTEM"."t_user_trig" 
BEFORE INSERT ON "SYSTEM"."T_USER" 
REFERENCING OLD AS "OLD" NEW AS "NEW" 
FOR EACH ROW 
DECLARE
BEGIN
  SELECT seq_t_user.nextval 
  INTO :new.userid FROM dual;
END;

-- T_BOOK_TYPE 触发器
CREATE TRIGGER "SYSTEM"."t_book_type_trig"
BEFORE INSERT ON "SYSTEM"."T_BOOK_TYPE"
FOR EACH ROW
BEGIN
  SELECT seq_t_book_type.nextval 
  INTO :new.booktypeid FROM dual;
END;`,
    details: [
      "BEFORE INSERT: 插入前触发",
      "FOR EACH ROW: 行级触发器",
      "序列(Sequence) + 触发器实现自增主键",
      "REFERENCING 子句定义新旧行别名",
      "触发器可维护审计日志字段",
    ],
  },
  {
    id: "procedure",
    title: "过程 & 函数",
    icon: "Code2",
    description: "存储过程（Procedure）和函数（Function）是预编译的 PL/SQL 代码块，封装业务逻辑在数据库层执行。",
    codeExample: `-- 借阅图书存储过程
CREATE OR REPLACE PROCEDURE "SP_BORROW_BOOK" (
  p_bookid IN NUMBER,
  p_userid IN NUMBER,
  p_result OUT NUMBER
) AS
BEGIN
  UPDATE "T_BOOK_INFO" 
  SET ISBORROWED = 1 
  WHERE BOOKID = p_bookid 
    AND ISBORROWED = 0;
  
  IF SQL%ROWCOUNT = 1 THEN
    INSERT INTO "T_BORROW"(BOOKID, USERID, BORROWDATE)
    VALUES(p_bookid, p_userid, SYSDATE);
    p_result := 1;
  ELSE
    p_result := 0;
  END IF;
  COMMIT;
END;`,
    details: [
      "存储过程: 执行操作，无返回值",
      "函数: 必须返回一个值",
      "IN/OUT/IN OUT 三种参数模式",
      "PL/SQL 支持异常处理机制",
      "包(Package)可组织相关过程函数",
    ],
  },
  {
    id: "lob",
    title: "大对象",
    icon: "FileImage",
    description: "大对象（LOB）用于存储大量非结构化数据。Oracle 支持 CLOB、BLOB、NCLOB、BFILE 四种 LOB 类型。",
    codeExample: `-- 添加图书封面 BLOB 字段
ALTER TABLE "T_BOOK_INFO" ADD (
  "BOOKCOVER" BLOB,
  "FULLDESC" CLOB
);

-- CLOB 存储大文本描述
UPDATE "T_BOOK_INFO" SET FULLDESC = EMPTY_CLOB()
WHERE BOOKID = 1;

-- BLOB 存储二进制图片数据
UPDATE "T_BOOK_INFO" SET BOOKCOVER = EMPTY_BLOB()
WHERE BOOKID = 1;`,
    details: [
      "CLOB: 存储单字节字符大数据（最大 4GB）",
      "BLOB: 存储二进制数据（图片、文档等）",
      "NCLOB: 存储多字节国家字符集数据",
      "BFILE: 只读二进制文件指针",
      "LOB 数据可存储在表内或独立表空间",
    ],
  },
];

export const tableSchemas = [
  {
    tableName: "T_USER",
    description: "用户表 - 存储系统用户信息",
    columns: [
      { name: "USERID", type: "NUMBER", nullable: false, isPrimary: true, desc: "用户ID（主键）" },
      { name: "USERNAME", type: "VARCHAR2(254)", nullable: false, isPrimary: false, desc: "用户名" },
      { name: "USERPASSWORD", type: "VARCHAR2(254)", nullable: false, isPrimary: false, desc: "密码" },
      { name: "ISADMIN", type: "NUMBER", nullable: false, isPrimary: false, desc: "是否管理员(1=是,0=否)" },
    ],
    constraints: [
      { name: "SYS_C0011108", type: "PRIMARY KEY", column: "USERID" },
      { name: "SYS_C0011105", type: "CHECK", column: "USERNAME IS NOT NULL" },
      { name: "SYS_C0011106", type: "CHECK", column: "USERPASSWORD IS NOT NULL" },
      { name: "SYS_C0011107", type: "CHECK", column: "ISADMIN IS NOT NULL" },
    ],
    trigger: "t_user_trig",
  },
  {
    tableName: "T_BOOK_TYPE",
    description: "图书类型表 - 存储图书分类信息",
    columns: [
      { name: "BOOKTYPEID", type: "NUMBER", nullable: false, isPrimary: true, desc: "类型ID（主键）" },
      { name: "BOOKTYPENAME", type: "VARCHAR2(254)", nullable: false, isPrimary: false, desc: "类型名称" },
      { name: "BOOKTYPEDESC", type: "VARCHAR2(254)", nullable: false, isPrimary: false, desc: "类型描述" },
    ],
    constraints: [
      { name: "SYS_C0011121", type: "PRIMARY KEY", column: "BOOKTYPEID" },
      { name: "SYS_C0011118", type: "CHECK", column: "BOOKTYPEID IS NOT NULL" },
      { name: "SYS_C0011119", type: "CHECK", column: "BOOKTYPENAME IS NOT NULL" },
      { name: "SYS_C0011120", type: "CHECK", column: "BOOKTYPEDESC IS NOT NULL" },
    ],
    trigger: "t_book_type_trig",
  },
  {
    tableName: "T_BOOK_INFO",
    description: "图书信息表 - 存储图书详细信息",
    columns: [
      { name: "BOOKID", type: "NUMBER", nullable: false, isPrimary: true, desc: "图书ID（主键）" },
      { name: "BOOKNAME", type: "VARCHAR2(255)", nullable: false, isPrimary: false, desc: "图书名称" },
      { name: "BOOKAUTHOR", type: "VARCHAR2(255)", nullable: false, isPrimary: false, desc: "作者" },
      { name: "BOOKPRICE", type: "NUMBER", nullable: false, isPrimary: false, desc: "价格" },
      { name: "BOOKTYPEID", type: "NUMBER", nullable: false, isPrimary: false, desc: "类型ID（外键）" },
      { name: "BOOKDESC", type: "VARCHAR2(1000)", nullable: false, isPrimary: false, desc: "简介" },
      { name: "ISBORROWED", type: "NUMBER", nullable: false, isPrimary: false, desc: "是否借出" },
      { name: "BOOKIMG", type: "VARCHAR2(255)", nullable: false, isPrimary: false, desc: "图片URL" },
    ],
    constraints: [
      { name: "SYS_C0011124", type: "PRIMARY KEY", column: "BOOKID" },
      { name: "FK_BOOK_TYPE", type: "FOREIGN KEY", column: "BOOKTYPEID → T_BOOK_TYPE.BOOKTYPEID" },
    ],
    trigger: "t_book_info_trig",
  },
  {
    tableName: "T_BORROW",
    description: "借阅记录表 - 存储图书借阅信息",
    columns: [
      { name: "BORROWID", type: "NUMBER", nullable: false, isPrimary: true, desc: "借阅ID（主键）" },
      { name: "BOOKID", type: "NUMBER", nullable: false, isPrimary: false, desc: "图书ID（外键）" },
      { name: "USERID", type: "NUMBER", nullable: false, isPrimary: false, desc: "用户ID（外键）" },
      { name: "BORROWDATE", type: "DATE", nullable: false, isPrimary: false, desc: "借阅日期" },
      { name: "RETURNDATE", type: "DATE", nullable: true, isPrimary: false, desc: "归还日期" },
    ],
    constraints: [
      { name: "SYS_C0011130", type: "PRIMARY KEY", column: "BORROWID" },
      { name: "FK_BORROW_BOOK", type: "FOREIGN KEY", column: "BOOKID → T_BOOK_INFO.BOOKID" },
      { name: "FK_BORROW_USER", type: "FOREIGN KEY", column: "USERID → T_USER.USERID" },
    ],
    trigger: "t_borrow_trig",
  },
];

export const relationshipData = {
  nodes: [
    { id: "T_USER", label: "用户表", x: 100, y: 100, color: "#C084FC" },
    { id: "T_BOOK_TYPE", label: "图书类型表", x: 500, y: 100, color: "#22D3EE" },
    { id: "T_BOOK_INFO", label: "图书信息表", x: 300, y: 300, color: "#F472B6" },
    { id: "T_BORROW", label: "借阅记录表", x: 200, y: 500, color: "#FBBF24" },
  ],
  edges: [
    { from: "T_BOOK_TYPE", to: "T_BOOK_INFO", label: "BOOKTYPEID", type: "foreignkey" },
    { from: "T_BOOK_INFO", to: "T_BORROW", label: "BOOKID", type: "foreignkey" },
    { from: "T_USER", to: "T_BORROW", label: "USERID", type: "foreignkey" },
  ],
};
