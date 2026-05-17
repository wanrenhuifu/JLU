import { TKCard } from '../../components/TKCard'
import { TKCommunityDetailFooter } from '../../components/TKCommunityDetailFooter'
import { TKCommunityDetailItem } from '../../components/TKCommunityDetailItem'
import { TKNavBar } from '../../components/TKNavBar'
import { router } from '@kit.ArkUI'
import { TKRouterParms } from '../../models/TKRouterParms'
import { getArticleDetailApi, likeArticleApi, likeCommentApi } from '../../api/CommunityApi'
import { ArticleDetailData, TKComment } from '../../models/Community'
import { Utils } from '../../utils/Utils'
import { it } from '@ohos/hypium'
import { TKIMGPreview } from '../../components/TKIMGPreview'

@Entry
@Component
struct TKCommunityDetail {
  //文章id
  postId: string = ''

  aboutToAppear(): void {
    const parms = router.getParams() as TKRouterParms
    if (parms) {
      this.postId = parms.id
    }
    this.getArticleDetail()
    getContext().eventHub.on('articleDetailChange', () => {
      this.getArticleDetail()
    })
  }

  //预览图片数据源
  preViewIMGs:string[] = []
  //要预览的图片的索引
  preViewIndex:number = 0

  preViewController:CustomDialogController = new CustomDialogController({
    builder:TKIMGPreview({
      list:this.preViewIMGs,
      currentIndex:this.preViewIndex
    }),
    customStyle:true
  })

  //文章详情数据
  @State
  articleDetailData: ArticleDetailData = {} as ArticleDetailData
  //评论列表数据
  @State
  commentList: TKComment[] = []

  //获取详情数据方法
  async getArticleDetail() {
    this.articleDetailData = await getArticleDetailApi(this.postId)
    this.commentList = this.articleDetailData.comments
  }

  @Builder
  getTopItem() {
    TKCard({ paddingTop: 28, paddingBottom: 14 }) {
      Text(this.articleDetailData.title)
        .fontSize(15)
        .fontColor($r('app.color.text_primary'))
        .fontWeight(FontWeight.Bold)
        .width('100%')
      Text(this.articleDetailData.content)
        .fontSize(14)
        .fontColor($r('app.color.text_primary'))
        .width('100%')
        .margin({
          top: 13,
          bottom: 13
        })
      if (this.articleDetailData.images?.length > 0) {
        GridRow({ columns: 3 }) {
          ForEach(this.articleDetailData.images, (imgUrl: string,index:number) => {
            GridCol() {
              Image(Utils.getImgUrl(imgUrl))
                .borderRadius(7)
                .onClick(()=>{
                  this.preViewIMGs = this.articleDetailData.images
                  this.preViewIndex = index
                  this.preViewController.open()
                })
            }
            .width(101)
            .height(74)
            .padding(4)
          })
        }
        .width('100%')
      }
      Divider().strokeWidth(0.5).width('100%').color($r('app.color.line_color'))
        .margin({
          top: 16,
          bottom: 11
        })
      Row() {
        ForEach([1, 2, 3], () => {
          Image($r('app.media.avatar'))
            .width(26)
            .aspectRatio(1)
        })
      }
      .width('100%')
    }
  }

  //文章点赞和取消点赞
  async likeArticleClick() {
    await likeArticleApi(this.postId, !this.articleDetailData.isLiked)
    if (this.articleDetailData.isLiked) { //取消点赞
      this.articleDetailData.likedCount--
    } else { //点赞
      this.articleDetailData.likedCount++
    }
    this.articleDetailData.isLiked = !this.articleDetailData.isLiked
  }

  //评论点赞
  async likeComment(item: TKComment) {
    await likeCommentApi(item.commentId, !item.isLiked)
    if (item.isLiked) { //取消点赞
      item.likedCount--
    } else { //点赞
      item.likedCount++
    }
    item.isLiked = !item.isLiked

  }

  build() {
    Stack({ alignContent: Alignment.Top }) {
      Image($r('app.media.navbar_back'))
        .width('100%')
        .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP])
      Column() {
        TKNavBar({ title: '详情' })
          .padding({
            left: 15,
            right: 15
          })
        Scroll() {
          Column() {
            if (this.articleDetailData) {
              this.getTopItem()
            }
            TKCard({ marginTop: 10 }) {
              Row({ space: 3 }) {
                Row().width(4.5).height(14).borderRadius(2.5).backgroundColor($r('app.color.text_primary'))
                Text('全部评论')
                  .fontSize(15)
                  .fontColor($r('app.color.text_primary'))
                  .fontWeight(FontWeight.Bold)
              }
              .width('100%')
              .margin({
                top: 24,
                bottom: 7.5
              })

              List() {
                ForEach(this.commentList, (item: TKComment) => {
                  ListItem() {
                    TKCommunityDetailItem({
                      item: item, likeClick: (item: TKComment) => {
                        this.likeComment(item)
                      }
                    })
                  }
                })
              }
              .divider({ strokeWidth: 0.5, color: $r('app.color.line_color') })
              .width('100%')
            }
          }
          .width('100%')
        }
        .scrollBar(BarState.Off)
        .align(Alignment.Top)
        .width('100%')
        .layoutWeight(1)

        TKCommunityDetailFooter({
          articleDetailData: this.articleDetailData, likeClick: () => {
            this.likeArticleClick()
          }
        })
      }
      .width('100%')
      .height('100%')
    }
    .backgroundColor($r('app.color.back_color'))
    .width('100%')
    .height('100%')
  }
}