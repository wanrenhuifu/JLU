import { TabBarClass } from '../models/TabBarClass'
import { router } from '@kit.ArkUI'
import { TKCommunity } from './Community/TKCommunity'
import { TKMine } from './Mine/TKMine'
import { TKHome } from './Home/TKHome'
import { TKMessage } from './Message/TKMessage'
import { TKAdditional } from './Additional/TKAdditional'

@Entry
@Component
struct Index {
  tabList: TabBarClass[] =
    [
      {
        title: '刷题',
        name: 'home',
        icon: $r('app.media.home_normal'),
        selectIcon: $r('app.media.home_select')
      },
      {
        title: '消息',
        name: 'message',
        icon: $r('app.media.home_normal'),
        selectIcon: $r('app.media.home_select')
      },
      {
        title: '额外',
        name: 'additional',
        icon: $r('app.media.home_normal'),
        selectIcon: $r('app.media.home_select')
      },
      {
        title: '社区',
        name: 'community',
        icon: $r('app.media.community_normal'),
        selectIcon: $r('app.media.community_select')
      },
      {
        title: '我的',
        name: 'mine',
        icon: $r('app.media.min_normal'),
        selectIcon: $r('app.media.min_select')
      }
    ]
  //记录tabs当前选中的索引 - 默认显示消息Tab
  @State
  currentIndex: number = 1

  @Builder
  getTabBar(item: TabBarClass, index: number) {
    Column({ space: 3 }) {
      Image(this.currentIndex === index ? item.selectIcon : item.icon)
        .width(22.5)
        .aspectRatio(1)
      Text(item.title)
        .fontSize(11)
        .fontColor(this.currentIndex === index ? $r('app.color.primary') : $r('app.color.text_second'))
    }
  }

  build() {
    Tabs({ barPosition: BarPosition.End, index: $$this.currentIndex }) {
      ForEach(this.tabList, (item: TabBarClass, index: number) => {
        TabContent() {
          if (item.name === 'home') {
            TKHome()
          } else if (item.name === 'message') {
            TKMessage()
          } else if (item.name === 'additional') {
            TKAdditional()
          } else if (item.name === 'community') {
            TKCommunity()
          } else {
            TKMine()
          }
        }.tabBar(this.getTabBar(item, index))
        .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP])
      })
    }
    .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP])
    .width('100%')
    .height('100%')
  }
}