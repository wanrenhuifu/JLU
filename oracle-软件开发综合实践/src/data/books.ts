import type { Book, BookType, UserData, BorrowRecord } from "@/types";

const STORAGE_KEYS = {
  books: "obm_books",
  borrows: "obm_borrows",
  users: "obm_users",
  bookTypes: "obm_book_types",
  initialized: "obm_initialized",
};

// 初始图书数据
const defaultBooks: Book[] = [
  {
    bookId: 1,
    bookName: "Java程序设计",
    bookAuthor: "耿祥义",
    bookPrice: 55.5,
    bookTypeId: 1,
    bookTypeName: "计算机科学",
    bookDesc: "《Java2实用教程》不仅可以作为高等院校相关专业的教材，也适合自学者及软件开发人员参考使用。Java是一种很优秀的编程语言，具有面向对象、与平台无关、安全、稳定和多线程等特点。",
    isBorrowed: 0,
    bookImg: "/images/book-java.jpg",
  },
  {
    bookId: 2,
    bookName: "红楼梦",
    bookAuthor: "曹雪芹",
    bookPrice: 36,
    bookTypeId: 3,
    bookTypeName: "文学",
    bookDesc: "《红楼梦》是一部百科全书式的长篇小说。以宝黛爱情悲剧为主线，以四大家族的荣辱兴衰为背景，描绘出18世纪中国封建社会的方方面面。",
    isBorrowed: 0,
    bookImg: "/images/book-hongloumeng.jpg",
  },
  {
    bookId: 4,
    bookName: "西游记",
    bookAuthor: "吴承恩",
    bookPrice: 60,
    bookTypeId: 3,
    bookTypeName: "文学",
    bookDesc: "《西游记》主要描写的是孙悟空保唐僧西天取经，历经九九八十一难的故事。唐僧取经是历史上一件真实的事。",
    isBorrowed: 0,
    bookImg: "/images/book-xiyouji.svg",
  },
  {
    bookId: 5,
    bookName: "水浒传",
    bookAuthor: "施耐庵",
    bookPrice: 50.6,
    bookTypeId: 3,
    bookTypeName: "文学",
    bookDesc: "《水浒传》是我国第一部以农民起义为题材的长篇章回小说，是我国文学史上一座巍然屹立的丰碑。",
    isBorrowed: 0,
    bookImg: "/images/book-shuihu.svg",
  },
  {
    bookId: 12,
    bookName: "三国演义",
    bookAuthor: "罗贯中",
    bookPrice: 42,
    bookTypeId: 3,
    bookTypeName: "文学",
    bookDesc: "《三国演义》又名《三国志演义》、《三国志通俗演义》，是我国小说史上最著名最杰出的长篇章回体历史小说。",
    isBorrowed: 0,
    bookImg: "/images/book-sanguo.svg",
  },
  {
    bookId: 13,
    bookName: "三体（全集）",
    bookAuthor: "刘慈欣",
    bookPrice: 92,
    bookTypeId: 4,
    bookTypeName: "科幻",
    bookDesc: "三体三部曲 (《三体》《三体Ⅱ·黑暗森林》《三体Ⅲ·死神永生》) ，原名“地球往事三部曲”，是中国著名科幻作家刘慈欣的首个长篇系列。",
    isBorrowed: 0,
    bookImg: "/images/book-santi.jpg",
  },
  {
    bookId: 14,
    bookName: "天龙八部",
    bookAuthor: "金庸",
    bookPrice: 58,
    bookTypeId: 6,
    bookTypeName: "小说",
    bookDesc: "天龙八部乃金笔下的一部长篇小说，与《射雕》，《神雕》等几部长篇小说一起被称为可读性最高的金庸小说。",
    isBorrowed: 0,
    bookImg: "/images/book-tianlong.svg",
  },
  {
    bookId: 27,
    bookName: "明朝那些事儿",
    bookAuthor: "当年明月",
    bookPrice: 399,
    bookTypeId: 2,
    bookTypeName: "历史",
    bookDesc: "国民史学读本，持续风行十余年，畅销3000万册，全本白话正说明朝大历史。",
    isBorrowed: 0,
    bookImg: "/images/book-mingchao.jpg",
  },
  {
    bookId: 28,
    bookName: "沙丘",
    bookAuthor: "Frank Herbert",
    bookPrice: 394.9,
    bookTypeId: 4,
    bookTypeName: "科幻",
    bookDesc: "每个“不可不读”的书单上都有《沙丘》！伟大的《沙丘》六部曲中文版初次完整出版！",
    isBorrowed: 0,
    bookImg: "/images/book-scifi.svg",
  },
];

// 初始借阅记录
const defaultBorrows: BorrowRecord[] = [
  { borrowId: 10, bookId: 1, bookName: "Java程序设计", userName: "李明", borrowDate: "2024-01-15", status: "active" },
  { borrowId: 11, bookId: 2, bookName: "红楼梦", userName: "zhang", borrowDate: "2024-01-10", returnDate: "2024-01-20", status: "returned" },
  { borrowId: 12, bookId: 13, bookName: "三体（全集）", userName: "wangpeng", borrowDate: "2024-02-01", status: "active" },
];

// 初始用户数据
// 密码工具：Base64 编码（演示用，生产环境应使用更安全的哈希方案）
export function encodePassword(raw: string): string {
  try {
    return btoa(unescape(encodeURIComponent(raw)));
  } catch {
    return raw;
  }
}

export function verifyPassword(raw: string, stored: string): boolean {
  return encodePassword(raw) === stored;
}

const defaultUsers: UserData[] = [
  { userId: 1, userName: "admin", userPassword: encodePassword("admin"), isAdmin: 1 },
  { userId: 2, userName: "李明", userPassword: encodePassword("123456"), isAdmin: 0 },
  { userId: 11, userName: "zhang", userPassword: encodePassword("123"), isAdmin: 0 },
  { userId: 13, userName: "zhao", userPassword: encodePassword("abc"), isAdmin: 1 },
  { userId: 14, userName: "wangpeng", userPassword: encodePassword("123456"), isAdmin: 0 },
  { userId: 15, userName: "wp123", userPassword: encodePassword("wp456"), isAdmin: 1 },
];

const defaultBookTypes: BookType[] = [
  { bookTypeId: 1, bookTypeName: "计算机科学", bookTypeDesc: "计算机相关" },
  { bookTypeId: 2, bookTypeName: "历史", bookTypeDesc: "历史相关" },
  { bookTypeId: 3, bookTypeName: "文学", bookTypeDesc: "文学相关" },
  { bookTypeId: 4, bookTypeName: "科幻", bookTypeDesc: "科幻相关" },
  { bookTypeId: 6, bookTypeName: "小说", bookTypeDesc: "小说相关" },
  { bookTypeId: 7, bookTypeName: "外语", bookTypeDesc: "外语相关" },
];

// 兼容旧导出名
export const books = defaultBooks;
export const users = defaultUsers;
export const bookTypes = defaultBookTypes;

// ========== localStorage 持久化工具 ==========

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  return fallback;
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

/** 从 localStorage 加载图书列表（自动同步代码中的封面更新） */
export function loadBooks(): Book[] {
  const list = load<Book[]>(STORAGE_KEYS.books, defaultBooks);

  // 自动同步封面路径：如果代码里的默认封面有更新，自动覆盖缓存
  const withUpdatedCovers = list.map((book) => {
    const defaultBook = defaultBooks.find((b) => b.bookId === book.bookId);
    return defaultBook && defaultBook.bookImg !== book.bookImg
      ? { ...book, bookImg: defaultBook.bookImg }
      : book;
  });

  const hasCoverUpdate = withUpdatedCovers.some(
    (b, i) => b.bookImg !== list[i].bookImg
  );

  // 首次访问：初始化借阅状态并保存
  if (!localStorage.getItem(STORAGE_KEYS.initialized)) {
    const initialized = withUpdatedCovers.map((b) => ({
      ...b,
      isBorrowed: [1, 2, 13].includes(b.bookId) ? 1 : 0,
    }));
    save(STORAGE_KEYS.books, initialized);
    save(STORAGE_KEYS.initialized, "true");
    return initialized;
  }

  // 非首次但有封面更新：写回 localStorage
  if (hasCoverUpdate) {
    save(STORAGE_KEYS.books, withUpdatedCovers);
  }

  return withUpdatedCovers;
}

export function saveBooks(list: Book[]) {
  save(STORAGE_KEYS.books, list);
}

/** 从 localStorage 加载借阅记录 */
export function loadBorrows(): BorrowRecord[] {
  return load<BorrowRecord[]>(STORAGE_KEYS.borrows, defaultBorrows);
}

export function saveBorrows(list: BorrowRecord[]) {
  save(STORAGE_KEYS.borrows, list);
}

/** 从 localStorage 加载用户列表（自动迁移明文密码为编码格式） */
export function loadUsers(): UserData[] {
  const list = load<UserData[]>(STORAGE_KEYS.users, defaultUsers);
  const migrated = migrateUserPasswords(list);
  // 如果发生了迁移，自动保存回 localStorage
  if (migrated.some((u, i) => u.userPassword !== list[i].userPassword)) {
    saveUsers(migrated);
  }
  return migrated;
}

export function saveUsers(list: UserData[]) {
  save(STORAGE_KEYS.users, list);
}

/** 将现有用户列表的密码升级为编码格式（兼容旧数据） */
export function migrateUserPasswords(list: UserData[]): UserData[] {
  return list.map((u) => {
    // 如果密码不是 Base64 格式（长度小于 4 或解码后不一致），则进行编码
    try {
      const decoded = decodeURIComponent(escape(atob(u.userPassword)));
      if (decoded === u.userPassword && u.userPassword.length > 0) {
        return { ...u, userPassword: encodePassword(u.userPassword) };
      }
    } catch {
      return { ...u, userPassword: encodePassword(u.userPassword) };
    }
    return u;
  });
}

/** 图书分类持久化 */
export function loadBookTypes(): BookType[] {
  return load<BookType[]>(STORAGE_KEYS.bookTypes, defaultBookTypes);
}

export function saveBookTypes(list: BookType[]) {
  save(STORAGE_KEYS.bookTypes, list);
}

/** 重置所有数据为初始状态 */
export function resetAllData() {
  localStorage.removeItem(STORAGE_KEYS.books);
  localStorage.removeItem(STORAGE_KEYS.borrows);
  localStorage.removeItem(STORAGE_KEYS.users);
  localStorage.removeItem(STORAGE_KEYS.bookTypes);
  localStorage.removeItem(STORAGE_KEYS.initialized);
  // 同时清除登录用户（可选，这里保留登录状态以便演示）
}

/** 获取下一个可用 ID */
export function getNextId(list: { bookId: number }[]): number;
export function getNextId(list: { userId: number }[]): number;
export function getNextId(list: { borrowId: number }[]): number;
export function getNextId(list: { [key: string]: number }[]): number {
  const key = Object.keys(list[0] || {}).find((k) => /Id$/.test(k)) || "id";
  const max = list.reduce((m, item) => Math.max(m, (item as Record<string, number>)[key] || 0), 0);
  return max + 1;
}
