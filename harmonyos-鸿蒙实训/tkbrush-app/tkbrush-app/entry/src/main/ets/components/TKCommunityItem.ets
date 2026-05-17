import { Article } from '../models/Community'
import { Utils } from '../utils/Utils'
import { TKCard } from './TKCard'
import dayjs from '@hview/dayjs'

@Preview
@Component
struct TKCommunityItem {

  item:Article = {} as Article

  @Builder
  getItem(icon:ResourceStr,title:string){
    Row({space:2}){
      Image(icon)
        .width(9)
        .aspectRatio(1)
      Text(title)
        .fontSize(10)
        .fontColor($r('app.color.text_third'))
    }
  }

  build() {
    TKCard({paddingTop:17,paddingBottom:17}){
      Text(this.item.title)
        .fontSize(15)
        .fontColor($r('app.color.text_primary'))
        .fontWeight(FontWeight.Bold)
        .width('100%')
        .maxLines(1)
        .textOverflow({overflow:TextOverflow.Ellipsis})

      Row({space:12}){
        Text(this.item.content)
          .fontSize(12)
          .fontColor($r('app.color.text_second'))
          .layoutWeight(1)
          .maxLines(2)
          .textOverflow({overflow:TextOverflow.Ellipsis})
        Image($r('app.media.more'))
          .width(2.5)
          .height(10)
      }
      .width('100%')
      .margin({
        top:11
      })
      if (this.item.images.length>0){
        GridRow({columns:3}){
          ForEach(this.item.images.length>3?this.item.images.slice(1,3):this.item.images,(imgUrl:string)=>{
            GridCol(){
              Image(Utils.getImgUrl(imgUrl))
                .borderRadius(7)
            }
            .width(101)
            .height(74)
            .margin(4)
          })
        }
        .width('100%')
      }


      Row(){
        Row({space:4}){
          Image(Utils.getImgUrl(this.item.authorAvatar))
            .width(14)
            .aspectRatio(1)
            .borderRadius(7)
          Text(this.item.authorName)
            .fontSize(10)
            .fontColor($r('app.color.text_second'))
        }
        .backgroundColor($r('app.color.avtar_back'))
        .padding(4)
        .borderRadius(5)
      }
      .width('100%')
      .margin({
        top:8,
        bottom:5
      })
      Divider().strokeWidth(0.5).width('100%').color($r('app.color.line_color'))

      Row(){
        this.getItem($r('app.media.community_time'),Utils.getTimeStr(this.item.createdAt))
        Blank()
        Row(){
          this.getItem($r('app.media.community_browse'),this.item.viewCount.toString())
          this.getItem($r('app.media.like_normal'),this.item.likeCount.toString())
          this.getItem($r('app.media.community_comment'),this.item.replyCount.toString())
        }
        .justifyContent(FlexAlign.SpaceBetween)
        .width(130)
      }
      .width('100%')
      .margin({
        top:14
      })
    }
  }
}

export {TKCommunityItem}