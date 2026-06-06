import type { ExperimentModule } from '../../app.ts';
import { FBScheduler } from './algorithm.ts';
import { CPUSchedulerUI } from './ui.ts';

export default {
  name: 'CPU调度：反馈排队算法',
  description: 'FB多级反馈队列调度模拟',
  init(container: HTMLElement) {
    const scheduler = new FBScheduler([
      { priority: 3, timeSlice: 2 },
      { priority: 2, timeSlice: 4 },
      { priority: 1, timeSlice: 8 },
    ]);
    scheduler.addProcess('P1', 10);
    scheduler.addProcess('P2', 6);
    scheduler.addProcess('P3', 8);
    const ui = new CPUSchedulerUI(container, scheduler);
    (container as any)._cleanup = () => ui.destroy();
  },
  destroy() {
    const container = document.getElementById('content-area');
    if (container && (container as any)._cleanup) {
      (container as any)._cleanup();
    }
  }
} as ExperimentModule;
