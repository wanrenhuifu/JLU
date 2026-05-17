import { PaperData, ListParms, QuestionData, StartQuestionParms, SubmitPaperParms,
  TKQuestionResult } from '../models/Paper';
import { request } from '../utils/Request';

/**
 * 获取试卷列表
 */
export function getPaperListApi(data:ListParms){
  return request<PaperData,ListParms>({url:'/quiz-community/public/v1.0/quiz/papers',method:'get',params:data})
}

/**
 * 获取试卷中的所有试题
 */
export function getQuestionsApi(data:ListParms,paperId:string){
  return request<QuestionData,ListParms>({url:`/quiz-community/public/v1.0/quiz/papers/${paperId}/questions`,method:'get',params:data})
}

/**
 * 开始答题
 */
export function startQuestionApi(data:StartQuestionParms,paperId:string){
  return request<null,StartQuestionParms>({url:`/quiz-community/public/v1.0/quiz/papers/${paperId}/paper:start`,method:'post',data:data})
}

/**
 * 交卷
 */
export function submitPaperApi(data:SubmitPaperParms,paperId:string){
  return request<null,SubmitPaperParms>({url:`/quiz-community/public/v1.0/quiz/papers/${paperId}/paper:submit`,method:'post',data:data})
}
/**
 * 获取练习报告
 */
export function getQuestionResultApi(paperId:string){
  return request<TKQuestionResult,null>({url:`/quiz-community/public/v1.0/quiz/papers/${paperId}/results`})
}

/**
 * 获取最近刷题列表
 */
export function getUserPapersApi(data:ListParms){
  return request<PaperData,ListParms>({url:'/quiz-community/public/v1.0/quiz/user-papers',method:'get',params:data})
}