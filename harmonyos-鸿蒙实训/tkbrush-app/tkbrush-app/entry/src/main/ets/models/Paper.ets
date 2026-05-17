
export interface ListParms {
  /**
   * 页码
   */
  page: number;
  /**
   * 每页条数
   */
  pageSize: number;
  /**
   * 试卷难度级别：1 初级，2 进阶
   */
  type?: number;
}

export interface PaperData {
  /**
   * 试卷数组
   */
  papers: Paper[];
  /**
   * 试卷列表总数
   */
  total: number;
}

export interface Paper {
  /**
   * 当前用户答题数量
   */
  answerCount?: number;
  /**
   * 试卷数据ID
   */
  paperId?: number;
  /**
   * 试卷题目数量
   */
  questionCount?: number;
  /**
   * 试卷名称
   */
  title?: string;
  /**
   * 试卷类型：1 初级，2进阶
   */
  type: number;
  /**
   * 用户提交试卷状态：0  未提交（未答题） 开始答题 ，1 已提交 重新答题，2 保存未提交 继续答题
   */
  userSubmitStatus: number;
}
export interface QuestionData {
  /**
   * 题目信息数组
   */
  questions: Question[];
  /**
   * 题目总数
   */
  total: number;
}

export interface Question {
  /**
   * 题目ID
   */
  id: number;
  /**
   * 选项数组
   */
  options?: Option[];
  /**
   * 题干
   */
  questionText?: string;
  /**
   * 题目类型：1 单选，2  多选，3 判断
   */
  type: number;
  /**
   * 用户答案
   */
  userAnswer: string[];
}

export interface Option {
  /**
   * 选项描述
   */
  desc?: string;
  /**
   * 选项标识
   */
  identify: string;
}

export interface StartQuestionParms {
  /**
   * 1：开始答题 2：继续答题 3：重新答题
   */
  status: number;
}

export interface SubmitPaperParms {
  /**
   * 当前用户答案数组
   */
  answers: TKUserAnswer[];
  /**
   * 交卷状态：1 交卷，2：保存不交卷
   */
  submitStatus: number;
}

export interface TKUserAnswer {
  /**
   * 题目信息ID
   */
  questionId: number;
  /**
   * 答案数组
   */
  userAnswer: string[];
}

export interface TKQuestionResult {
  /**
   * 答题卡
   */
  answerSheet: TKAnswerSheet[];
  /**
   * 正确数量
   */
  correctCount: number;
  /**
   * 错误数量
   */
  incorrectCount: number;
  /**
   * 试卷名称
   */
  paperName: string;
  /**
   * 提交时间戳
   */
  submitTime: number;
  /**
   * 总用时（秒）
   */
  totalTime: number;
  /**
   * 未答题数量
   */
  unansweredCount: number;
}

export interface TKAnswerSheet {
  /**
   * 用户答案状态：0 错误，1 正确，2 未答题
   */
  answerStatus: number;
  /**
   * 题目ID
   */
  positionId?: number;
}