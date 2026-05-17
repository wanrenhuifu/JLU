import { AbilityConstant, UIAbility, Want } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { window } from '@kit.ArkUI';

export default class EntryAbility extends UIAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onCreate');
  }

  onDestroy(): void {
    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onDestroy');
  }

  onWindowStageCreate(windowStage: window.WindowStage): void {
    // Main window is created, set main page for this ability
    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onWindowStageCreate');

    // 直接加载引导页（简化版，每次启动都显示）
    windowStage.loadContent('pages/Onboarding/TKOnboarding', (err) => {
      if (err.code) {
        hilog.error(0x0000, 'testTag', 'Failed to load onboarding. Cause: %{public}s', JSON.stringify(err) ?? '');
        // 如果引导页加载失败，降级到主页面
        windowStage.loadContent('pages/Index', (err) => {
          if (err.code) {
            hilog.error(0x0000, 'testTag', 'Failed to load Index. Cause: %{public}s', JSON.stringify(err) ?? '');
          }
        });
        return;
      }
      hilog.info(0x0000, 'testTag', 'Succeeded in loading onboarding page.');
    });
  }

  onWindowStageDestroy(): void {
    // Main window is destroyed, release UI related resources
    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onWindowStageDestroy');
  }

  onForeground(): void {
    // Ability has brought to foreground
    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onForeground');
  }

  onBackground(): void {
    // Ability has back to background
    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onBackground');
  }
}
