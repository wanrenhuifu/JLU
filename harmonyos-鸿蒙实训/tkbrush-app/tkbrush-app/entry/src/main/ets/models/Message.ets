/**
 * 消息类型枚举
 */
export enum MessageType {
  SYSTEM = 'system',      // 系统通知
  GROUP = 'group',        // 群组消息
  PERSONAL = 'personal',  // 个人消息
  ASSISTANT = 'assistant' // 助手消息
}

/**
 * 消息数据模型
 */
export class MessageItem {
  id: string = ''                    // 消息ID
  type: MessageType = MessageType.PERSONAL  // 消息类型
  avatar: Resource = $r('app.media.app_icon')     // 头像
  name: string = ''                  // 昵称/群名
  content: string = ''               // 最后一条消息内容
  time: string = ''                  // 时间
  unreadCount: number = 0            // 未读消息数
  isPinned: boolean = false          // 是否置顶

  constructor(id: string, type: MessageType, avatar: Resource, name: string, 
              content: string, time: string, unreadCount: number, isPinned: boolean) {
    this.id = id
    this.type = type
    this.avatar = avatar
    this.name = name
    this.content = content
    this.time = time
    this.unreadCount = unreadCount
    this.isPinned = isPinned
  }
}

/**
 * 获取模拟消息数据
 */
export function getMockMessages(): MessageItem[] {
  const messages: MessageItem[] = []
  
  // 系统通知
  messages.push(new MessageItem(
    '1',
    MessageType.SYSTEM,
    $r('app.media.app_icon'),
    '系统通知',
    '恭喜你！昨日刷题正确率达到 95%。',
    '',
    1,
    true
  ))
  
  // 群组消息
  messages.push(new MessageItem(
    '2',
    MessageType.GROUP,
    $r('app.media.community_normal'),
    '考研数学交流群',
    '张老师：大家记得看今天的错题集更新。',
    '10:45',
    12,
    false
  ))
  
  // 个人消息
  messages.push(new MessageItem(
    '3',
    MessageType.PERSONAL,
    $r('app.media.min_normal'),
    '李辅导员',
    '你的模拟考成绩出来了，有空聊聊吗？',
    '昨天',
    0,
    false
  ))
  
  // 助手消息
  messages.push(new MessageItem(
    '4',
    MessageType.ASSISTANT,
    $r('app.media.home_normal'),
    '每日一练助手',
    '今日打卡任务已刷新，快来挑战吧！',
    '星期一',
    0,
    false
  ))
  
  return messages
}
