
export interface MineItem{
  /**
   * 左侧图标
   */
  icon:ResourceStr,
  //标题
  title:string,
  //点击执行的操作
  itemClick:()=>void
}

export interface SettingItem{
  leftTitle:string //左侧标题
  rightTitle?:string //右侧标题
  //点击执行的操作
  itemClick:()=>void
}