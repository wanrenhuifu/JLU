// 图书类型
export interface Book {
  bookId: number;
  bookName: string;
  bookAuthor: string;
  bookPrice: number;
  bookTypeId: number;
  bookTypeName: string;
  bookDesc: string;
  isBorrowed: number;
  bookImg: string;
}

// 借阅记录
export interface BorrowRecord {
  borrowId: number;
  bookId: number;
  bookName: string;
  userName: string;
  borrowDate: string;
  returnDate?: string;
  status: "active" | "returned";
}

// 用户数据
export interface UserData {
  userId: number;
  userName: string;
  userPassword: string;
  isAdmin: number;
}

// 登录用户信息
export interface LoggedUser {
  userName: string;
  isAdmin: number;
  userId: number;
}

// 图书类型分类
export interface BookType {
  bookTypeId: number;
  bookTypeName: string;
  bookTypeDesc: string;
}
