import { getUserInfoApi } from '../../api/UserApi'
import { TKCard } from '../../components/TKCard'
import { TKMineItem } from '../../components/TKMineItem'
import { TKNavBar } from '../../components/TKNavBar'
import { MineItem } from '../../models/Mine'
import { UserInfo } from '../../models/User'
import { Utils } from '../../utils/Utils'
import { router } from '@kit.ArkUI'
import { formToJSON } from '@ohos/axios'
import { JSON } from '@kit.ArkTS'

@Preview
@Component
struct TKMine {

  aboutToAppear(): void {
    this.getUserInfo()
    getContext().eventHub.on('userInfoChange',()=>{
      this.getUserInfo()
    })
  }
  //用户信息
  @State
  userInfo:UserInfo = {} as UserInfo

  async getUserInfo(){
    this.userInfo = await getUserInfoApi()
  }

  list:MineItem[] =
    [
      {
        icon: $r('app.media.mine_about'),
        title: '关于我们',
        itemClick: () => {
          router.pushUrl({
            url:'pages/Mine/TKAbout'
          })
        }
      },
        {
        icon:$r('app.media.mine_setting'),
        title:'设置',
        itemClick:()=>{
          router.pushUrl({
            url:'pages/Mine/TKSetting',
            params:this.userInfo
          })
        }
      }
    ]

  build() {
    Stack({ alignContent: Alignment.Top }) {
      Image($r('app.media.navbar_back'))
        .width('100%')
        .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP])
      Column() {
        TKNavBar({ title: '我的', ISShowBack: false })
        Row({space:5}){
          Image(Utils.getImgUrl(this.userInfo.avatar))
            .width(53)
            .aspectRatio(1)
            .borderRadius(26.5)
          Text(this.userInfo.nickname)
            .fontSize(15)
            .fontColor($r('app.color.text_primary'))
            .fontWeight(FontWeight.Bold)
          Blank()
          Image($r('app.media.mine_edit'))
            .width(14)
            .aspectRatio(1)
            .onClick(()=>{
              router.pushUrl({
                url:'pages/Mine/TKSetting',
                params:this.userInfo
              })
            })
        }
        .width('100%')
        .margin({
          bottom:7.5
        })
        TKCard({paddingLeft:26,paddingRight:22,paddingTop:31,paddingBottom:31,marginLeft:0,marginRight:0}){
          Row(){
            Image($r('app.media.brush_count'))
              .width(33)
              .height(28)
            Text('刷题数量')
              .fontSize(14)
              .fontColor($r('app.color.text_primary'))
            Blank()
            Text(`${this.userInfo.questionAnswerCount}题`)
              .fontSize(14)
              .fontColor($r('app.color.primary'))
              .fontWeight(FontWeight.Medium)
          }
          .width('100%')
        }
        Row({space:3}){
          Row().width(4.5).height(14).borderRadius(2.5).backgroundColor($r('app.color.text_primary'))
          Text('其它')
            .fontSize(15)
            .fontColor($r('app.color.text_primary'))
            .fontWeight(FontWeight.Bold)
        }
        .width('100%')
        .margin({
          top:24,
          bottom:7.5
        })
        TKCard({marginLeft:0,marginRight:0}){
          List(){
            ForEach(this.list,(item:MineItem)=>{
              ListItem(){
                TKMineItem({item:item})
              }
            })
          }
          .width('100%')
          .divider({strokeWidth:1})
        }

      }
      .padding({
        left:15,
        right:15
      })
      .width('100%')
      .height('100%')
    }
    .backgroundColor($r('app.color.back_color'))
    .width('100%')
    .height('100%')
  }
}

export {TKMine}