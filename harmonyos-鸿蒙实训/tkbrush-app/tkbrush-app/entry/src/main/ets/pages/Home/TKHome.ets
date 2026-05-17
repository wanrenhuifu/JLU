import { getHomeImgsApi } from '../../api/HomeApi'
import { TKPaperItem } from '../../components/TKPaperItem'
import { HomeImg } from '../../models/Home'
import { ListParms, Paper } from '../../models/Paper'
import { Utils } from '../../utils/Utils'
import { router } from '@kit.ArkUI'
import { getUserPapersApi } from '../../api/PaperApi'

@Preview
@Component
struct TKHome {
  build() {
    Column() {
      // 顶部标题
      Row() {
        Text('智学刷题')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
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
      
      // 内容区域
      Column({ space: 20 }) {
        // 欢迎卡片
        Column({ space: 12 }) {
          Text('🎯 欢迎使用智学刷题')
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')
          
          Text('本页面需要连接后端API才能显示完整内容')
            .fontSize(14)
            .fontColor('#666666')
            .textAlign(TextAlign.Center)
          
          Text('请切换到"消息"或"额外"Tab查看已完成的功能模块')
            .fontSize(13)
            .fontColor('#999999')
            .textAlign(TextAlign.Center)
        }
        .width('90%')
        .padding(30)
        .backgroundColor('#F0F9FF')
        .borderRadius(16)
        .margin({ top: 40 })
        
        // 功能提示
        Column({ space: 16 }) {
          Text('✅ 已完成的功能')
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor('#333333')
          
          this.FeatureItem('💬', '消息模块', '仿微信消息列表，含未读提示')
          this.FeatureItem('📊', '学习中心', '数据统计、错题本、周报')
          this.FeatureItem('🚀', '引导页', '首次启动引导（需配置）')
        }
        .width('90%')
        .padding(20)
        .backgroundColor(Color.White)
        .borderRadius(12)
        .shadow({ radius: 8, color: 'rgba(0,0,0,0.05)', offsetY: 2 })
      }
      .layoutWeight(1)
      .width('100%')
      .justifyContent(FlexAlign.Center)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
  
  @Builder
  FeatureItem(icon: string, title: string, desc: string) {
    Row({ space: 12 }) {
      Text(icon)
        .fontSize(28)
      
      Column({ space: 4 }) {
        Text(title)
          .fontSize(15)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333333')
        
        Text(desc)
          .fontSize(12)
          .fontColor('#999999')
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
    }
    .width('100%')
    .padding({ left: 12, right: 12, top: 10, bottom: 10 })
  }
}

export {TKHome}