import { getPaperListApi } from '../../api/PaperApi'
import { TKNavBar } from '../../components/TKNavBar'
import { TKPaperItem } from '../../components/TKPaperItem'
import { TKTopTabs } from '../../components/TKTopTabs'
import { Paper, ListParms } from '../../models/Paper'
import { router } from '@kit.ArkUI'
import { TKRouterParms } from '../../models/TKRouterParms'
import { TKList } from '../../components/TKList'

@Entry
@Component
struct TKPaperListPage {
  // //试卷类型 1：初级 2：进阶
  // paperType: number = 1

  //tab项当前选中的索引
  @State
  currentIndex: number = 0
  @State
  total: number = 0

  //顶部tab切换
  tabChange(currentIndex: number) {
    this.parms.type = currentIndex + 1
    this.getPaperList()
  }

  //列表数据
  @State
  paperList: Paper[] = []

  aboutToAppear(): void {
    const parms = router.getParams() as TKRouterParms
    if (parms && parms.type) {
      this.currentIndex = parms.type
      this.parms.type = parms.type + 1
      this.getPaperList()
    }
    this.getPaperList()
    getContext().eventHub.on('paperListChange', () => {
      this.getPaperList()
    })
  }

  parms: ListParms = {
    type: 1,
    page: 1,
    pageSize: 10
  }

  //获取试卷列表  下拉刷新
  async getPaperList() {
    this.parms.page = 1
    const paperData = await getPaperListApi(this.parms)
    this.total = paperData.total
    this.paperList = paperData.papers
  }

  //上拉加载更多
  async loadMore(){
    this.parms.page++
    const paperData = await getPaperListApi(this.parms)
    this.total = paperData.total
    this.paperList.push(...paperData.papers)
  }

  @Builder
  getListItem(item: object) {
    TKPaperItem({ item: item as Paper })
  }

  build() {
    Stack({ alignContent: Alignment.Top }) {
      Image($r('app.media.navbar_back'))
        .width('100%')
        .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP])
      Column() {
        TKNavBar({ title: '刷题' })
          .margin({
            left: 15,
            right: 15
          })
        TKTopTabs({
          list: ['初级试题', '进阶试题'], currentIndex: this.currentIndex, itemClick: (currentIndex: number) => {
            this.tabChange(currentIndex)
          }
        })
        // Refresh({ refreshing: $$this.isRefreshing}) {
        //   List({ space: 11 }) {
        //     ForEach(this.paperList, (item: Paper) => {
        //       ListItem(){
        //         TKPaperItem({ item: item })
        //       }
        //     })
        //   }
        //   .width('100%')
        //   .layoutWeight(1)
        // }
        // .onRefreshing(() => {
        //   this.getPaperList()
        // })
        // .width('100%')
        TKList({
          dataList: this.paperList,
          total: this.total,
          listItem: (item: object) => {
            this.getListItem(item)
          },
          downLoad: async () => {
            await this.getPaperList()
          },
          loadMore: () => {
            this.loadMore()
          }
        })
          .layoutWeight(1)
      }
      .width('100%')
      .height('100%')
    }
    .backgroundColor($r('app.color.back_color'))
    .width('100%')
    .height('100%')
  }
}