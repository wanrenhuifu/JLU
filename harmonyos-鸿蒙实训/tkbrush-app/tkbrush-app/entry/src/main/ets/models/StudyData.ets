/**
 * 学习统计数据模型
 */
export class StudyStats {
  userId: string = ''              // 用户ID
  userName: string = '学习达人'     // 用户名
  avatar: Resource = $r('app.media.app_icon')   // 用户头像
  studyDays: number = 32           // 累计学习天数
  totalQuestions: number = 1268    // 总刷题数
  wrongQuestions: number = 128     // 错题总数
  favoriteQuestions: number = 56   // 收藏题目数
  weeklyData: number[] = [45, 62, 38, 71, 55, 48, 89] // 本周做题量（周一到周日）
  ranking: string = 'Top 5%'       // 全站排名

  constructor(userId: string, userName: string, avatar: Resource, 
              studyDays: number, totalQuestions: number, wrongQuestions: number,
              favoriteQuestions: number, weeklyData: number[], ranking: string) {
    this.userId = userId
    this.userName = userName
    this.avatar = avatar
    this.studyDays = studyDays
    this.totalQuestions = totalQuestions
    this.wrongQuestions = wrongQuestions
    this.favoriteQuestions = favoriteQuestions
    this.weeklyData = weeklyData
    this.ranking = ranking
  }
}

/**
 * 功能卡片数据模型
 */
export class FeatureCard {
  id: string = ''
  title: string = ''
  value: string | number = ''
  icon: Resource = $r('app.media.app_icon')
  route: string = ''  // 路由地址

  constructor(id: string, title: string, value: string | number, icon: Resource, route: string) {
    this.id = id
    this.title = title
    this.value = value
    this.icon = icon
    this.route = route
  }
}

/**
 * 获取模拟学习数据
 */
export function getMockStudyStats(): StudyStats {
  return new StudyStats(
    'user_001',
    '学习达人',
    $r('app.media.app_icon'),
    32,
    1268,
    128,
    56,
    [45, 62, 38, 71, 55, 48, 89],
    'Top 5%'
  )
}

/**
 * 获取功能卡片列表
 */
export function getFeatureCards(stats: StudyStats): FeatureCard[] {
  const cards: FeatureCard[] = []
  
  cards.push(new FeatureCard(
    '1',
    '我的错题',
    `${stats.wrongQuestions}题`,
    $r('app.media.home_normal'),
    '/pages/WrongQuestions'
  ))
  
  cards.push(new FeatureCard(
    '2',
    '收藏题目',
    `${stats.favoriteQuestions}题`,
    $r('app.media.community_normal'),
    '/pages/FavoriteQuestions'
  ))
  
  cards.push(new FeatureCard(
    '3',
    '学习周报',
    '查看详情',
    $r('app.media.home_select'),
    '/pages/WeeklyReport'
  ))
  
  cards.push(new FeatureCard(
    '4',
    '全站排名',
    stats.ranking,
    $r('app.media.community_select'),
    '/pages/Ranking'
  ))
  
  return cards
}

