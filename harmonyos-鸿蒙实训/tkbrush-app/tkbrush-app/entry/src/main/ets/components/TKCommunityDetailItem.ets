import { TKComment } from '../models/Community'
import { Utils } from '../utils/Utils'
import { TKIMGPreview } from './TKIMGPreview'

@Preview
@Component
struct TKCommunityDetailItem {
  @Prop
  item:TKComment = {} as TKComment

  likeClick:(item:TKComment)=>void = ()=>{}

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

  build() {
    Column(){
      Row(){
        Image(Utils.getImgUrl(this.item.authorAvatar))
          .width(21)
          .aspectRatio(1)
          .borderRadius(10.5)
        Text(this.item.authorName)
          .fontSize(13)
          .fontColor($r('app.color.text_second'))
          .margin({
            left:6,
            right:10
          })
        Image($r('app.media.community_time'))
          .width(9)
          .aspectRatio(1)
          .margin({
            right:2
          })
        Text(Utils.getTimeStr(this.item.timestamp))
          .fontSize(10)
          .fontColor($r('app.color.text_third'))
        Blank()
        Image($r('app.media.more'))
          .width(2.5)
          .height(10)
      }
      .margin({
        top:10
      })
      .width('100%')
      Text(this.item.content)
        .fontSize(13)
        .fontColor($r('app.color.text_primary'))
        .width('100%')
        .margin({
          top:8,
          bottom:5
        })
      if (this.item.images.length>0){
        GridRow({columns:3}){
          ForEach(this.item.images,(imgUrl:string,index:number)=>{
            GridCol(){
              Image(Utils.getImgUrl(imgUrl))
                .borderRadius(7)
                .onClick(()=>{
                  this.preViewIMGs = this.item.images
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
      Row({space:3}){
        Image(this.item.isLiked?$r('app.media.like_select'):$r('app.media.like_normal'))
          .width(10)
          .aspectRatio(1)
        Text(this.item.likedCount>0?this.item.likedCount.toString():'赞')
          .fontSize(10)
          .fontColor(this.item.isLiked?$r('app.color.primary'):$r('app.color.text_third'))
      }
      .justifyContent(FlexAlign.End)
      .width('100%')
      .margin({
        top:4,
        bottom:9
      })
      .onClick(()=>{
        this.likeClick(this.item!)
      })
    }
    .width('100%')
  }
}

export {TKCommunityDetailItem}