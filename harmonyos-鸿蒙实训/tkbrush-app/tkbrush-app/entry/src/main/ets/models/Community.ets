export interface ArticleData {
  posts: Article[];
  total: number;
}

export interface Article {
  authorAvatar: string;
  authorName?: string;
  content?: string;
  createdAt: number;
  likeCount: number;
  postId?: number;
  replyCount: number;
  title?: string;
  viewCount: number;
  images:string[]
}


export interface PublishArticleParms {
  /**
   * 帖子内容
   */
  content: string;
  /**
   * 帖子图片数组
   */
  images: string[];
  /**
   * 帖子标题
   */
  title?: string;
}

export interface ArticleDetailData {
  /**
   * 帖子创建者头像
   */
  authorAvatar: string;
  /**
   * 帖子创建者姓名
   */
  authorName: string;
  /**
   * 帖子回复数组
   */
  comments: TKComment[];
  /**
   * 帖子内容
   */
  content: string;
  /**
   * 帖子图片数组
   */
  images: string[];
  /**
   * 当前用户是否已点赞帖子
   */
  isLiked: boolean;
  /**
   * 帖子点赞数
   */
  likedCount: number;
  /**
   * 帖子ID
   */
  postId: number;
  /**
   * 帖子创建时间戳
   */
  timestamp: number;
  /**
   * 帖子标题
   */
  title: string;
}

export interface TKComment {
  /**
   * 回复人头像
   */
  authorAvatar: string;
  /**
   * 回复人姓名
   */
  authorName: string;
  /**
   * 回复ID
   */
  commentId: number;
  /**
   * 回复内容
   */
  content: string;
  /**
   * 回复图片数组
   */
  images: string[];
  /**
   * 当前用户是否已点赞评论
   */
  isLiked: boolean;
  /**
   * 评论点赞数
   */
  likedCount: number;
  /**
   * 回复时间戳
   */
  timestamp: number;
}

