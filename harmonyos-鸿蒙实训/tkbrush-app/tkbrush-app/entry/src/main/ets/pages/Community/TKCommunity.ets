import { getArticleListApi } from '../../api/CommunityApi'
import { TKCommunityItem } from '../../components/TKCommunityItem'
import { TKNavBar } from '../../components/TKNavBar'
import { TKTopTabs } from '../../components/TKTopTabs'
import { Article } from '../../models/Community'
import { ListParms } from '../../models/Paper'
import { router } from '@kit.ArkUI'
import { TKList } from '../../components/TKList'


@Preview
@Component
struct TKCommunity {
  tabChange(currentIndex: number) {
    this.parms.type = currentIndex + 1
    this.downLoad()
  }

  @State
  isRefreshing: boolean = false
  //文章列表的数据源
  @State
  articleList: Article[] = []
  //当前有接口在请求，并且没有请求结束
  @State
  isLoading: boolean = false
  //列表数据是加载完
  @State
  isFinished: boolean = false
  //列表总数
  @State
  total: number = 0

  aboutToAppear(): void {
    this.downLoad()
    getContext().eventHub.on('articleListChange', () => {
      this.downLoad()
    })
  }

  @State
  parms: ListParms = {
    page: 1,
    pageSize: 15,
    type: 1
  }

  //下拉刷新
  async downLoad() {
    this.parms.page = 1
    const articleData = await getArticleListApi(this.parms)
    this.total = articleData.total
    this.articleList = articleData.posts
  }

  //上拉加载更多
  async loadMore() {
    this.parms.page++
    const articleData = await getArticleListApi(this.parms)
    const list = articleData.posts
    this.articleList.push(...list)
  }

  @Builder
  getListItem(item: object) {
    TKCommunityItem({ item: item as Article })
      .onClick(() => {
        router.pushUrl({
          url: 'pages/Community/TKCommunityDetail',
          params: { id: (item as Article).postId }
        })
      })
  }

  build() {
    Stack({ alignContent: Alignment.Top }) {
      Image($r('app.media.navbar_back'))
        .width('100%')
        .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP])
      Stack({ alignContent: Alignment.BottomEnd }) {
        Column() {
          TKNavBar({ title: '社区', ISShowBack: false })
          TKTopTabs({
            list: ['热门', '问答'], itemClick: (currentIndex: number) => {
              this.tabChange(currentIndex)
            }
          })
          TKList({ dataList: this.articleList, total: this.total, listItem:(item:object)=>{
            this.getListItem(item)
          }, downLoad:async ()=>{
             await this.downLoad()
          },loadMore:async ()=>{
            await this.loadMore()
          }})
            .layoutWeight(1)
        }
        .width('100%')
        .height('100%')

        if (this.parms.type === 2) {
          Image($r('app.media.community_publish'))
            .width(56)
            .aspectRatio(1)
            .margin({
              right: 5,
              bottom: 6
            })
            .onClick(() => {
              router.pushUrl({
                url: 'pages/Community/TKPublishArticle'
              })
            })
        }
      }
    }
    .backgroundColor($r('app.color.back_color'))
    .width('100%')
    .height('100%')
  }
}

export { TKCommunity }