import { ArticleDetailData } from '../models/Community'
import { router } from '@kit.ArkUI'

@Preview
@Component
struct TKCommunityDetailFooter {
  @Prop
  articleDetailData:ArticleDetailData = {} as ArticleDetailData
  //点赞事件
  likeClick:()=>void = ()=>{}

  build() {
    Row({space:7}){
      Image($r('app.media.avatar'))
        .width(35)
        .aspectRatio(1)
        .borderRadius(17.5)
      Text('我也来说句…')
        .fontSize(13)
        .fontColor($r('app.color.text_second'))
        .height(35)
        .layoutWeight(1)
        .backgroundColor($r('app.color.search_back'))
        .borderRadius(17.5)
        .padding({
          left:16
        })
        .onClick(()=>{
          router.pushUrl({
            url:'pages/Community/TKPublishArticle',
            params:{id:this.articleDetailData.postId}
          })
        })
      Row({space:3}){
        Image(this.articleDetailData.isLiked?$r('app.media.like_select'):$r('app.media.like_normal'))
          .width(13)
          .aspectRatio(1)
        Text(this.articleDetailData.likedCount>0?this.articleDetailData.likedCount.toString():'赞')
          .fontSize(13)
          .fontColor(this.articleDetailData.isLiked?$r('app.color.primary'):$r('app.color.text_third'))
      }
    }
    .padding({
      left:10,
      right:15
    })
    .backgroundColor($r('app.color.white'))
    .width('100%')
    .height(55)
    .onClick(()=>{
      this.likeClick()
    })
  }
}

export {TKCommunityDetailFooter}