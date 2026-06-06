import './styles/global.css';
import './styles/components.css';
import './styles/animations.css';

export interface ExperimentModule {
  readonly name: string;
  readonly description: string;
  init(container: HTMLElement): void;
  destroy(): void;
}

interface ExperimentMeta {
  id: string;
  name: string;
  description: string;
  loader: () => Promise<{ default: ExperimentModule }>;
}

const EXPERIMENTS: ExperimentMeta[] = [
  { id: 'exp01', name: 'CPU调度：反馈排队算法', description: 'FB多级反馈队列调度模拟', loader: () => import('./experiments/experiment01-cpu-scheduler/index.ts') },
  { id: 'exp02', name: '进程互斥：软件互斥算法', description: 'Dekker/Peterson/Lamport/Eisenburg模拟', loader: () => import('./experiments/experiment02-mutex/index.ts') },
  { id: 'exp03', name: '死锁避免：银行家算法', description: '安全性检测与资源分配', loader: () => import('./experiments/experiment03-banker/index.ts') },
  { id: 'exp04', name: '死锁检测：资源分配图约简', description: '环路判定与约简动画', loader: () => import('./experiments/experiment04-resource-graph/index.ts') },
  { id: 'exp05', name: '页面置换：工作集模型', description: 'FIFO/LRU/NUR/CLOCK算法', loader: () => import('./experiments/experiment05-page-replacement/index.ts') },
  { id: 'exp06', name: '读者写者：写者优先', description: '信号量P/V操作同步', loader: () => import('./experiments/experiment06-reader-writer/index.ts') },
  { id: 'exp07', name: '消息通信：缓冲技术', description: '发送/接收命令模拟', loader: () => import('./experiments/experiment07-message-passing/index.ts') },
  { id: 'exp08', name: '磁盘调度：引臂调度算法', description: 'FCFS/SSTF/SCAN/LOOK与时间计算', loader: () => import('./experiments/experiment08-disk-scheduler/index.ts') },
  { id: 'exp09', name: '反置页表：杂凑页式管理', description: 'Hash技术与地址转换', loader: () => import('./experiments/experiment09-inverted-page/index.ts') },
  { id: 'exp10', name: '伙伴系统：内存分配释放', description: '伙伴堆算法模拟', loader: () => import('./experiments/experiment10-buddy-system/index.ts') },
];

export class App {
  private contentArea: HTMLElement;
  private pageTitle: HTMLElement;
  private expSelect: HTMLSelectElement;
  private btnHome: HTMLButtonElement;
  private currentModule: ExperimentModule | null = null;
  private activeId: string | null = null;
  private loading = false;
  private moduleCache = new Map<string, ExperimentModule>();

  constructor() {
    this.contentArea = document.getElementById('content-area')!;
    this.pageTitle = document.getElementById('page-title')!;
    this.expSelect = document.getElementById('exp-select') as HTMLSelectElement;
    this.btnHome = document.getElementById('btn-home') as HTMLButtonElement;

    this.btnHome.addEventListener('click', () => this.renderWelcome());
    this.renderSelect();
    this.renderWelcome();
    this.preloadModules();
  }

  private async preloadModules() {
    await Promise.all(
      EXPERIMENTS.map(async meta => {
        try {
          const mod = await meta.loader();
          this.moduleCache.set(meta.id, mod.default);
        } catch (e) {
          console.warn(`预加载 ${meta.name} 失败`, e);
        }
      })
    );
    console.log('所有实验模块预加载完成');
  }

  private renderSelect() {
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '请选择实验...';
    this.expSelect.appendChild(defaultOpt);

    EXPERIMENTS.forEach((meta, index) => {
      const opt = document.createElement('option');
      opt.value = meta.id;
      opt.textContent = `${index + 1}. ${meta.name}`;
      this.expSelect.appendChild(opt);
    });

    this.expSelect.addEventListener('change', () => {
      const id = this.expSelect.value;
      if (!id) {
        this.renderWelcome();
        return;
      }
      const meta = EXPERIMENTS.find(e => e.id === id);
      if (meta) this.loadExperiment(meta);
    });
  }

  private renderWelcome() {
    if (this.loading) return;
    this.cleanupCurrent();
    this.pageTitle.textContent = '操作系统课程设计';
    this.expSelect.value = '';
    this.btnHome.style.display = 'none';
    this.contentArea.innerHTML = '';
    this.removeAnimationClass();
    void this.contentArea.offsetWidth;
    this.contentArea.classList.add('animate-fade-in-up');

    const welcome = document.createElement('div');
    welcome.className = 'welcome-page';
    welcome.innerHTML = `
      <h2>欢迎使用 OS Design 实验平台</h2>
      <p>本程序包含操作系统课程设计的 10 个模拟实验，涵盖 CPU 调度、进程同步、死锁、内存管理、磁盘调度等核心主题。<br>请从顶部下拉菜单选择一个实验开始。</p>
      <div class="welcome-grid"></div>
    `;
    const grid = welcome.querySelector('.welcome-grid')!;
    EXPERIMENTS.forEach((meta, i) => {
      const card = document.createElement('div');
      card.className = 'welcome-card';
      card.style.animation = `scaleIn 0.3s ease ${i * 0.04}s both`;
      card.innerHTML = `
        <div class="welcome-card-num">${i + 1}</div>
        <div class="welcome-card-title">${meta.name}</div>
        <div class="welcome-card-desc">${meta.description}</div>
      `;
      card.addEventListener('click', () => {
        this.expSelect.value = meta.id;
        this.loadExperiment(meta);
      });
      grid.appendChild(card);
    });
    this.contentArea.appendChild(welcome);
    this.activeId = null;
  }

  private async loadExperiment(meta: ExperimentMeta) {
    if (this.activeId === meta.id || this.loading) return;
    this.loading = true;

    this.cleanupCurrent();
    this.contentArea.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-tertiary)">加载中...</div>';

    let mod: ExperimentModule | undefined;

    // Try cache first
    if (this.moduleCache.has(meta.id)) {
      mod = this.moduleCache.get(meta.id);
    } else {
      // Fallback to dynamic import if not cached yet
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const imported = await meta.loader();
          mod = imported.default;
          this.moduleCache.set(meta.id, mod);
          break;
        } catch (e) {
          console.warn(`加载 ${meta.name} 失败 (尝试 ${attempt + 1}/3)`, e);
          if (attempt < 2) await new Promise(r => setTimeout(r, 300));
        }
      }
    }

    if (!mod) {
      this.contentArea.innerHTML = `
        <div style="padding:40px;text-align:center">
          <div style="color:var(--error);margin-bottom:12px">加载失败，请重试</div>
          <button id="retry-load" class="btn btn-primary">重新加载</button>
        </div>
      `;
      const retryBtn = this.contentArea.querySelector('#retry-load') as HTMLButtonElement;
      if (retryBtn) {
        retryBtn.addEventListener('click', () => this.loadExperiment(meta));
      }
      this.loading = false;
      return;
    }

    try {
      this.currentModule = mod;
      this.activeId = meta.id;
      this.pageTitle.textContent = this.currentModule.name;
      this.btnHome.style.display = 'inline-flex';
      this.contentArea.innerHTML = '';
      this.removeAnimationClass();
      void this.contentArea.offsetWidth;
      this.contentArea.classList.add('animate-fade-in-up');
      this.currentModule.init(this.contentArea);
    } catch (e) {
      this.contentArea.innerHTML = `<div style="padding:40px;color:var(--error)">初始化失败: ${e}</div>`;
    }

    this.loading = false;
  }

  private cleanupCurrent() {
    if (this.currentModule) {
      try {
        this.currentModule.destroy();
      } catch (e) {
        console.error('destroy error', e);
      }
      this.currentModule = null;
    }
  }

  private removeAnimationClass() {
    this.contentArea.classList.remove('animate-fade-in-up');
  }
}
