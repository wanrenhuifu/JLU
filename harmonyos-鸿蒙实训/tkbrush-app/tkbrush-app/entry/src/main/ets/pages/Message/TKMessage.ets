import { MessageItem, getMockMessages } from '../../models/Message'
import { promptAction } from '@kit.ArkUI'

/**
 * 消息模块 - 仿微信消息列表
 * 功能：展示系统通知、群组消息、个人消息、助手消息
 */
@Component
export struct TKMessage {
  // 消息列表数据
  @State messageList: MessageItem[] = []

  aboutToAppear(): void {
    // 初始化消息数据
    this.messageList = getMockMessages()
  }

  /**
   * 消息列表项组件
   */
  @Builder
  MessageListItem(item: MessageItem) {
    Row() {
      // 左侧：头像
      Image(item.avatar)
        .width(50)
        .height(50)
        .borderRadius(6)
        .margin({ right: 12 })

      // 中间：消息内容区域
      Column() {
        // 昵称/群名和时间
        Row() {
          Text(item.name)
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#333333')
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
            .layoutWeight(1)

          // 时间显示
          if (item.time) {
            Text(item.time)
              .fontSize(12)
              .fontColor('#666666')
              .margin({ left: 8 })
          }
        }
        .width('100%')
        .margin({ bottom: 4 })

        // 最后一条消息内容和未读标记
        Row() {
          Text(item.content)
            .fontSize(14)
            .fontColor('#666666')
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
            .layoutWeight(1)

          // 未读红点
          if (item.unreadCount > 0) {
            Badge({
              count: item.unreadCount,
              position: BadgePosition.Right,
              style: {
                badgeSize: 18,
                badgeColor: '#FF4444',
                fontSize: 11
              }
            }) {
              Text('')
            }
            .margin({ left: 8 })
          }
        }
        .width('100%')
      }
      .layoutWeight(1)
      .alignItems(HorizontalAlign.Start)
    }
    .width('100%')
    .padding({ left: 16, right: 16, top: 12, bottom: 12 })
    .backgroundColor(item.isPinned ? '#F5F5F5' : Color.White)
    .onClick(() => {
      // 点击进入详情页（暂时显示提示）
      promptAction.showToast({
        message: `进入${item.name}的聊天页面`,
        duration: 2000
      })
    })
  }

  build() {
    Column() {
      // 顶部导航栏
      Row() {
        Text('消息')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.text_primary'))
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .justifyContent(FlexAlign.Start)
      .backgroundColor(Color.White)

      // 分割线
      Divider()
        .color('#E5E5E5')
        .strokeWidth(0.5)

      // 消息列表
      List({ space: 0 }) {
        ForEach(this.messageList, (item: MessageItem) => {
          ListItem() {
            this.MessageListItem(item)
          }
        }, (item: MessageItem) => item.id)
      }
      .layoutWeight(1)
      .width('100%')
      .backgroundColor('#F8F8F8')
      .divider({
        strokeWidth: 0.5,
        color: '#E5E5E5',
        startMargin: 78,
        endMargin: 0
      })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8F8F8')
  }

  /**
   * 滑动操作按钮（仿微信）
   */
  @Builder
  SwipeActionBuilder(item: MessageItem) {
    Row() {
      Button('置顶')
        .width(70)
        .height('100%')
        .fontSize(14)
        .backgroundColor('#C8C9CC')
        .onClick(() => {
          promptAction.showToast({
            message: item.isPinned ? '取消置顶' : '已置顶',
            duration: 1500
          })
        })

      Button('删除')
        .width(70)
        .height('100%')
        .fontSize(14)
        .backgroundColor('#FF4444')
        .onClick(() => {
          promptAction.showToast({
            message: '删除消息',
            duration: 1500
          })
        })
    }
  }
}
