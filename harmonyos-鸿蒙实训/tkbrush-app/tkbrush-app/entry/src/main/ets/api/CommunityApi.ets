import { ArticleData, ArticleDetailData, PublishArticleParms } from '../models/Community';
import { ListParms } from '../models/Paper';
import { request } from '../utils/Request';

/**
 * 获取文章列表
 */
export function getArticleListApi(data:ListParms){
  return request<ArticleData,ListParms>({url:'/quiz-community/public/v1.0/community/posts',method:'get',params:data})
}

/**
 * 发布文章
 */
export function publishArticleApi(data:PublishArticleParms){
  return request<null,PublishArticleParms>({url:'/quiz-community/public/v1.0/community/posts',method:'post',data:data})
}

/**
 * 获取文章详情
 */
export function getArticleDetailApi(postId:string){
  return request<ArticleDetailData,null>({url:`/quiz-community/public/v1.0/community/posts/${postId}`})
}

/**
 * 发布评论
 */
export function publishComment(postId:string,data:PublishArticleParms){
  return request<null,PublishArticleParms>({url:`/quiz-community/public/v1.0/community/posts/${postId}/comment`,method:'post',data:data})
}

/**
 * 文章点赞和取消点赞
 */
export function likeArticleApi(postId:string,isLiked:boolean){
  return request<null,null>({url:`/quiz-community/public/v1.0/community/posts/${postId}/like`,method:isLiked?'put':'delete'})
}

/**
 * 评论点赞和取消点赞
 */
export function likeCommentApi(commentId:number,isLiked:boolean){
  return request<null,null>({url:`/quiz-community/public/v1.0/community/comments/${commentId}/like`,method:isLiked?'put':'delete'})
}