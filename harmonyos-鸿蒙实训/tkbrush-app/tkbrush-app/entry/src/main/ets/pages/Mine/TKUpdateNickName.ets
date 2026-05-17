import { TKNavBar } from '../../components/TKNavBar'
import { promptAction, router } from '@kit.ArkUI'
import { TKRouterParms } from '../../models/TKRouterParms'
import { updateUserInfoApi } from '../../api/UserApi'
import { UpdateUserParms } from '../../models/User'

@Entry
@Component
struct TKUpdateNickName {
  @State
  nickName:string = ''

  aboutToAppear(): void {
    const parms = router.getParams() as TKRouterParms
    this.nickName = parms.name
  }
  //修改昵称
  async updateNickName(){
    if (this.nickName.length <= 0) {
      AlertDialog.show({
        message:'请先输入昵称'
      })
      return
    }
    const parms:UpdateUserParms = {
      nickname:this.nickName
    }
    await updateUserInfoApi(parms)
    promptAction.showToast({
      message:'昵称修改成功'
    })
    getContext().eventHub.emit('userInfoChange')
    router.back({
      url:'pages/Mine/TKSetting',
      params:{name:this.nickName}
    })
  }

  build() {
    Stack({ alignContent: Alignment.Top }) {
      Image($r('app.media.second_navbar_back'))
        .width('100%')
        .height(81)
        .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP])
      Column() {
        TKNavBar({ title: '修改昵称' })
        TextInput({placeholder:'请输入昵称',text:$$this.nickName})
          .width('100%')
          .margin({
            left:13,
            top:55,
            bottom:10
          })
          .backgroundColor($r('app.color.back_color'))

        Divider().strokeWidth(2).color($r('app.color.primary'))
          .margin({
            left:13,
            bottom:40
          })
        Button(){
          Stack(){
            Image($r('app.media.button_back'))
              .width('100%')
            Text('提交')
              .fontSize(15)
              .fontColor($r('app.color.white'))
              .fontWeight(FontWeight.Bold)
          }
        }
        .margin({
          left:24,
          right:24
        })
        .onClick(()=>{
          this.updateNickName()
        })
      }
      .padding({
        left:15,
        right:15
      })
      .width('100%')
      .height('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor($r('app.color.back_color'))
  }
}