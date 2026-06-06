import { createElement } from '../../common/utils.ts';
import { createCard, createButton, createInput, createLogArea, addLog } from '../../common/ui-kit.ts';
import type { FBScheduler, Process } from './algorithm.ts';

export class CPUSchedulerUI {
  private container: HTMLElement;
  private scheduler: FBScheduler;
  private queueEls: HTMLElement[] = [];
  private runningEl: HTMLElement = null as unknown as HTMLElement;
  private waitingEl: HTMLElement = null as unknown as HTMLElement;
  private logArea: HTMLElement = null as unknown as HTMLElement;
  private timeEl: HTMLElement = null as unknown as HTMLElement;
  private processListEl: HTMLElement = null as unknown as HTMLElement;

  constructor(container: HTMLElement, scheduler: FBScheduler) {
    this.container = container;
    this.scheduler = scheduler;
    this.scheduler.onUpdate = () => this.render();

    this.container.innerHTML = '';
    const grid = createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'minmax(280px, 1fr) 2fr';
    grid.style.gap = '16px';

    // Left panel: config + controls
    const left = createElement('div');
    this.buildConfigPanel(left);
    this.buildControlPanel(left);
    this.buildProcessPanel(left);

    // Right panel: visualization
    const right = createElement('div');
    this.buildVisualization(right);

    grid.append(left, right);
    this.container.appendChild(grid);

    this.render();
  }

  private buildConfigPanel(parent: HTMLElement) {
    const { card, body } = createCard('队列配置');
    const queueList = createElement('div');
    queueList.id = 'queue-config-list';
    body.appendChild(queueList);

    for (let i = 0; i < this.scheduler.queues.length; i++) {
      const row = createElement('div', 'form-row');
      row.innerHTML = `
        <span class="form-label">队列${i + 1}</span>
        <input type="number" class="input" style="width:60px" value="${this.scheduler.queues[i].priority}" placeholder="优先级" disabled title="固定优先级${this.scheduler.queues[i].priority}">
        <input type="number" class="input" style="width:60px" id="ts-${i}" value="${this.scheduler.queues[i].timeSlice}" min="1">
        <span style="font-size:12px;color:var(--text-tertiary)">时间片</span>
      `;
      queueList.appendChild(row);
    }
    parent.appendChild(card);
  }

  private buildControlPanel(parent: HTMLElement) {
    const { card, body } = createCard('运行控制');
    const toolbar = createElement('div', 'toolbar');

    const btnStart = createButton('▶ 开始', 'primary');
    const btnPause = createButton('⏸ 暂停', 'secondary');
    const btnStep = createButton('⏭ 单步', 'secondary');
    const btnReset = createButton('↺ 重置', 'danger');

    btnStart.addEventListener('click', () => this.scheduler.start());
    btnPause.addEventListener('click', () => this.scheduler.pause());
    btnStep.addEventListener('click', () => this.scheduler.step());
    btnReset.addEventListener('click', () => this.scheduler.reset());

    toolbar.append(btnStart, btnPause, btnStep, btnReset);
    body.appendChild(toolbar);

    const speedRow = createElement('div', 'form-row');
    speedRow.innerHTML = `<span class="form-label">速度</span>`;
    const speedInput = createInput({ type: 'range', value: '500' }) as HTMLInputElement;
    speedInput.min = '50';
    speedInput.max = '1500';
    speedInput.style.flex = '1';
    const speedLabel = createElement('span', '', '500ms');
    speedLabel.style.fontSize = '12px';
    speedLabel.style.color = 'var(--text-tertiary)';
    speedLabel.style.width = '50px';
    speedInput.addEventListener('input', () => {
      const v = parseInt(speedInput.value);
      this.scheduler.setSpeed(v);
      speedLabel.textContent = `${v}ms`;
    });
    speedRow.append(speedInput, speedLabel);
    body.appendChild(speedRow);

    this.timeEl = createElement('div', '', `系统时钟: 0`);
    this.timeEl.style.fontSize = '13px';
    this.timeEl.style.fontWeight = '600';
    this.timeEl.style.marginTop = '8px';
    body.appendChild(this.timeEl);

    parent.appendChild(card);
  }

  private buildProcessPanel(parent: HTMLElement) {
    const { card, body } = createCard('进程管理');
    const form = createElement('div');
    form.innerHTML = `
      <div class="form-row">
        <span class="form-label">进程名</span>
        <input type="text" class="input" id="proc-name" placeholder="如 P1" style="flex:1">
      </div>
      <div class="form-row">
        <span class="form-label">运行时间</span>
        <input type="number" class="input" id="proc-time" value="5" min="1" style="width:80px">
        <button class="btn btn-primary btn-sm" id="btn-add-proc">添加</button>
      </div>
    `;
    body.appendChild(form);

    form.querySelector('#btn-add-proc')!.addEventListener('click', () => {
      const nameInput = form.querySelector('#proc-name') as HTMLInputElement;
      const timeInput = form.querySelector('#proc-time') as HTMLInputElement;
      const name = nameInput.value.trim() || `P${this.scheduler.processes.length + 1}`;
      const time = parseInt(timeInput.value) || 5;
      this.scheduler.addProcess(name, time);
      nameInput.value = '';
      addLog(this.logArea, `添加进程 ${name}，运行时间 ${time}`, 'info');
    });

    this.processListEl = createElement('div');
    this.processListEl.style.marginTop = '12px';
    this.processListEl.style.fontSize = '12px';
    body.appendChild(this.processListEl);

    parent.appendChild(card);
  }

  private buildVisualization(parent: HTMLElement) {
    const { card: cardQ, body: bodyQ } = createCard('就绪队列');
    this.queueEls = [];
    for (let i = 0; i < this.scheduler.queues.length; i++) {
      const row = createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '10px';
      row.style.marginBottom = '8px';
      const label = createElement('div', '', `队列${i + 1} (P=${this.scheduler.queues[i].priority}, TS=${this.scheduler.queues[i].timeSlice})`);
      label.style.width = '140px';
      label.style.fontSize = '12px';
      label.style.fontWeight = '600';
      label.style.color = 'var(--text-secondary)';
      const box = createElement('div');
      box.style.flex = '1';
      box.style.minHeight = '36px';
      box.style.display = 'flex';
      box.style.flexWrap = 'wrap';
      box.style.gap = '6px';
      box.style.padding = '6px';
      box.style.background = 'var(--bg-page)';
      box.style.borderRadius = 'var(--radius-md)';
      box.style.border = '1px dashed var(--border)';
      row.append(label, box);
      bodyQ.appendChild(row);
      this.queueEls.push(box);
    }
    parent.appendChild(cardQ);

    const row2 = createElement('div');
    row2.style.display = 'grid';
    row2.style.gridTemplateColumns = '1fr 1fr';
    row2.style.gap = '16px';
    row2.style.marginTop = '16px';

    const { card: cardRun, body: bodyRun } = createCard('CPU运行');
    this.runningEl = createElement('div');
    this.runningEl.style.minHeight = '60px';
    this.runningEl.style.display = 'flex';
    this.runningEl.style.alignItems = 'center';
    this.runningEl.style.justifyContent = 'center';
    this.runningEl.style.background = 'var(--bg-page)';
    this.runningEl.style.borderRadius = 'var(--radius-md)';
    this.runningEl.style.border = '2px dashed var(--border)';
    bodyRun.appendChild(this.runningEl);
    row2.appendChild(cardRun);

    const { card: cardWait, body: bodyWait } = createCard('等待队列 (I/O)');
    this.waitingEl = createElement('div');
    this.waitingEl.style.minHeight = '60px';
    this.waitingEl.style.display = 'flex';
    this.waitingEl.style.flexWrap = 'wrap';
    this.waitingEl.style.gap = '6px';
    this.waitingEl.style.padding = '8px';
    this.waitingEl.style.background = 'var(--bg-page)';
    this.waitingEl.style.borderRadius = 'var(--radius-md)';
    this.waitingEl.style.border = '1px dashed var(--border)';
    bodyWait.appendChild(this.waitingEl);
    row2.appendChild(cardWait);

    parent.appendChild(row2);

    const { card: cardLog, body: bodyLog } = createCard('事件日志');
    this.logArea = createLogArea();
    bodyLog.appendChild(this.logArea);
    parent.appendChild(cardLog);
  }

  private render() {
    // Update queues
    for (let i = 0; i < this.scheduler.queues.length; i++) {
      const box = this.queueEls[i];
      box.innerHTML = '';
      this.scheduler.readyQueues[i].forEach(p => {
        box.appendChild(this.createProcessChip(p));
      });
      if (this.scheduler.readyQueues[i].length === 0) {
        const empty = createElement('span', '', '(空)');
        empty.style.color = 'var(--text-tertiary)';
        empty.style.fontSize = '11px';
        box.appendChild(empty);
      }
    }

    // Update running
    this.runningEl.innerHTML = '';
    if (this.scheduler.runningProcess) {
      const p = this.scheduler.runningProcess;
      this.runningEl.style.borderColor = 'var(--accent)';
      this.runningEl.style.background = 'var(--accent-light)';
      this.runningEl.appendChild(this.createProcessChip(p, true));
      const info = createElement('div', '', `剩余: ${p.remainingTime} / 已用时间片: ${this.scheduler.timeInSlice}`);
      info.style.fontSize = '11px';
      info.style.color = 'var(--text-secondary)';
      info.style.marginLeft = '8px';
      this.runningEl.appendChild(info);
    } else {
      this.runningEl.style.borderColor = 'var(--border)';
      this.runningEl.style.background = 'var(--bg-page)';
      const empty = createElement('span', '', 'CPU空闲');
      empty.style.color = 'var(--text-tertiary)';
      this.runningEl.appendChild(empty);
    }

    // Update waiting
    this.waitingEl.innerHTML = '';
    this.scheduler.waitingQueue.forEach(p => {
      this.waitingEl.appendChild(this.createProcessChip(p));
    });
    if (this.scheduler.waitingQueue.length === 0) {
      const empty = createElement('span', '', '(空)');
      empty.style.color = 'var(--text-tertiary)';
      empty.style.fontSize = '11px';
      this.waitingEl.appendChild(empty);
    }

    // Update time
    this.timeEl.textContent = `系统时钟: ${this.scheduler.currentTime}`;

    // Update process list
    this.processListEl.innerHTML = '';
    const finished = this.scheduler.processes.filter(p => p.state === 'finished').length;
    const total = this.scheduler.processes.length;
    this.processListEl.appendChild(createElement('div', '', `总进程: ${total} | 已完成: ${finished}`));

    // Log events
    if (this.scheduler.runningProcess && this.scheduler.runningProcess.remainingTime === 0) {
      addLog(this.logArea, `进程 ${this.scheduler.runningProcess.name} 完成执行`, 'success');
    }
  }

  private createProcessChip(p: Process, large = false): HTMLElement {
    const chip = createElement('div', 'queue-item');
    chip.textContent = p.name;
    if (large) {
      chip.style.padding = '6px 14px';
      chip.style.fontSize = '14px';
      chip.style.fontWeight = '600';
    }
    const extra = createElement('span');
    extra.style.color = 'var(--text-tertiary)';
    extra.style.marginLeft = '4px';
    extra.style.fontSize = '11px';
    extra.textContent = `(${p.remainingTime})`;
    chip.appendChild(extra);
    return chip;
  }

  destroy() {
    this.scheduler.pause();
    this.scheduler.onUpdate = undefined;
  }
}
