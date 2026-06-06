import type { ExperimentModule } from '../../app.ts';
import { createElement, sleep, randomInt } from '../../common/utils.ts';
import { createCard, createButton, createSelect, createBadge, createToolbar } from '../../common/ui-kit.ts';

type Algorithm = 'dekker' | 'peterson' | 'lamport' | 'eisenburg';

interface ProcessState {
  id: number;
  status: 'idle' | 'want' | 'critical' | 'remainder';
}

export default {
  name: '进程互斥：软件互斥算法',
  description: 'Dekker/Peterson/Lamport/Eisenburg模拟',
  init(container: HTMLElement) {
    container.innerHTML = '';
    let running = false;
    let processCount = 3;
    let algorithm: Algorithm = 'peterson';
    let states: ProcessState[] = [];
    let timers: ReturnType<typeof setTimeout>[] = [];
    let turn = 0;
    let flag: boolean[] = [];
    let ticket: number[] = [];
    let choosing: boolean[] = [];

    const grid = createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'minmax(280px, 1fr) 2fr';
    grid.style.gap = '16px';

    // Left: controls
    const left = createElement('div');
    const { card: ctrlCard, body: ctrlBody } = createCard('控制面板');
    const toolbar = createToolbar();
    const btnStart = createButton('▶ 开始模拟', 'primary');
    const btnStop = createButton('⏹ 停止', 'danger');
    toolbar.append(btnStart, btnStop);
    ctrlBody.appendChild(toolbar);

    const algoRow = createElement('div', 'form-row');
    algoRow.innerHTML = `<span class="form-label">互斥算法</span>`;
    const algoSelect = createSelect([
      { value: 'dekker', label: 'Dekker算法' },
      { value: 'peterson', label: 'Peterson算法' },
      { value: 'lamport', label: 'Lamport面包店算法' },
      { value: 'eisenburg', label: 'Eisenburg/Mcguire算法' },
    ], 'peterson');
    algoSelect.addEventListener('change', () => {
      algorithm = algoSelect.value as Algorithm;
      reset();
    });
    algoRow.appendChild(algoSelect);
    ctrlBody.appendChild(algoRow);

    const countRow = createElement('div', 'form-row');
    countRow.innerHTML = `<span class="form-label">进程数</span>`;
    const countSelect = createSelect([
      { value: '2', label: '2个' },
      { value: '3', label: '3个' },
      { value: '4', label: '4个' },
      { value: '5', label: '5个' },
    ], '3');
    countSelect.addEventListener('change', () => {
      processCount = parseInt(countSelect.value);
      reset();
    });
    countRow.appendChild(countSelect);
    ctrlBody.appendChild(countRow);
    left.appendChild(ctrlCard);
    grid.appendChild(left);

    // Right: visualization
    const right = createElement('div');
    const { card: visCard, body: visBody } = createCard('临界区可视化');

    const criticalZone = createElement('div');
    criticalZone.style.border = '3px dashed var(--accent)';
    criticalZone.style.borderRadius = 'var(--radius-lg)';
    criticalZone.style.padding = '24px';
    criticalZone.style.minHeight = '100px';
    criticalZone.style.display = 'flex';
    criticalZone.style.flexDirection = 'column';
    criticalZone.style.alignItems = 'center';
    criticalZone.style.justifyContent = 'center';
    criticalZone.style.background = 'var(--accent-light)';
    criticalZone.style.transition = 'all 0.3s ease';
    criticalZone.innerHTML = `<div style="font-size:18px;font-weight:700;color:var(--accent)">🔒 临界区</div><div id="critical-content" style="margin-top:8px;font-size:14px;color:var(--text-secondary)">空闲</div>`;
    visBody.appendChild(criticalZone);

    const processesArea = createElement('div');
    processesArea.style.display = 'flex';
    processesArea.style.flexWrap = 'wrap';
    processesArea.style.gap = '12px';
    processesArea.style.marginTop = '20px';
    processesArea.id = 'processes-area';
    visBody.appendChild(processesArea);

    const logArea = createElement('div', 'log-area');
    logArea.style.marginTop = '16px';
    logArea.style.maxHeight = '150px';
    visBody.appendChild(logArea);

    right.appendChild(visCard);
    grid.appendChild(right);
    container.appendChild(grid);

    function addLog(msg: string) {
      const entry = createElement('div', 'log-entry', msg);
      logArea.appendChild(entry);
      logArea.scrollTop = logArea.scrollHeight;
    }

    function reset() {
      stop();
      states = Array.from({ length: processCount }, (_, i) => ({ id: i, status: 'idle' }));
      flag = Array(processCount).fill(false);
      ticket = Array(processCount).fill(0);
      choosing = Array(processCount).fill(false);
      turn = 0;
      renderProcesses();
      (criticalZone.querySelector('#critical-content') as HTMLElement).textContent = '空闲';
      logArea.innerHTML = '';
    }

    function stop() {
      running = false;
      timers.forEach(t => clearTimeout(t));
      timers = [];
    }

    function renderProcesses() {
      processesArea.innerHTML = '';
      states.forEach(s => {
        const card = createElement('div');
        card.style.padding = '12px 16px';
        card.style.borderRadius = 'var(--radius-md)';
        card.style.background = 'var(--bg-card)';
        card.style.border = '1px solid var(--border)';
        card.style.minWidth = '120px';
        card.style.textAlign = 'center';
        card.style.transition = 'all 0.3s ease';

        let badgeText = '空闲';
        let badgeType: 'success' | 'warning' | 'error' | 'info' = 'info';
        if (s.status === 'want') { badgeText = '请求进入'; badgeType = 'warning'; card.style.borderColor = 'var(--warning)'; }
        if (s.status === 'critical') { badgeText = '临界区中'; badgeType = 'error'; card.style.borderColor = 'var(--error)'; card.style.background = 'var(--error-bg)'; }
        if (s.status === 'remainder') { badgeText = '剩余区'; badgeType = 'success'; }

        card.innerHTML = `
          <div style="font-weight:600;margin-bottom:6px">进程 ${s.id + 1}</div>
          <div id="badge-wrap"></div>
          ${algorithm === 'lamport' ? `<div style="font-size:11px;color:var(--text-tertiary);margin-top:4px">T=${ticket[s.id]}</div>` : ''}
          ${algorithm === 'dekker' || algorithm === 'peterson' ? `<div style="font-size:11px;color:var(--text-tertiary);margin-top:4px">flag=${flag[s.id]}</div>` : ''}
        `;
        (card.querySelector('#badge-wrap') as HTMLElement).appendChild(createBadge(badgeText, badgeType));
        processesArea.appendChild(card);
      });
    }

    async function runAlgorithm() {
      running = true;
      addLog(`开始使用 ${algoSelect.options[algoSelect.selectedIndex].text}`);
      while (running) {
        for (let i = 0; i < processCount && running; i++) {
          await enterCritical(i);
          if (!running) break;
          await criticalSection(i);
          if (!running) break;
          await exitCritical(i);
          if (!running) break;
          await remainderSection(i);
        }
      }
    }

    async function enterCritical(i: number) {
      states[i].status = 'want';
      renderProcesses();
      addLog(`进程${i + 1} 请求进入临界区`);
      await sleep(600);

      if (algorithm === 'dekker') {
        flag[i] = true;
        while (flag[1 - i]) {
          if (turn !== i) {
            flag[i] = false;
            while (turn !== i) await sleep(100);
            flag[i] = true;
          }
        }
      } else if (algorithm === 'peterson') {
        flag[i] = true;
        turn = 1 - i;
        let waitCount = 0;
        while (flag[1 - i] && turn === 1 - i && waitCount < 20) {
          await sleep(100);
          waitCount++;
        }
      } else if (algorithm === 'lamport') {
        choosing[i] = true;
        ticket[i] = Math.max(...ticket) + 1;
        choosing[i] = false;
        renderProcesses();
        for (let j = 0; j < processCount; j++) {
          if (j === i) continue;
          while (choosing[j]) await sleep(50);
          while (ticket[j] !== 0 && (ticket[j] < ticket[i] || (ticket[j] === ticket[i] && j < i))) await sleep(50);
        }
      } else if (algorithm === 'eisenburg') {
        let j = (i + 1) % processCount;
        let allIdle = true;
        for (let k = 0; k < processCount; k++) {
          if (states[k].status !== 'idle' && k !== i) allIdle = false;
        }
        if (!allIdle) {
          while (j !== i) {
            if (states[j].status !== 'idle') {
              await sleep(200);
              j = (j + 1) % processCount;
            } else {
              j = (j + 1) % processCount;
            }
          }
        }
      }

      states[i].status = 'critical';
      renderProcesses();
      (criticalZone.querySelector('#critical-content') as HTMLElement).textContent = `进程 ${i + 1} 正在执行`;
      criticalZone.style.background = 'var(--error-bg)';
      addLog(`进程${i + 1} 进入临界区`);
    }

    async function criticalSection(_i: number) {
      const delay = randomInt(800, 2000);
      await sleep(delay);
    }

    async function exitCritical(i: number) {
      states[i].status = 'remainder';
      renderProcesses();
      (criticalZone.querySelector('#critical-content') as HTMLElement).textContent = '空闲';
      criticalZone.style.background = 'var(--accent-light)';
      addLog(`进程${i + 1} 退出临界区`);

      if (algorithm === 'dekker') {
        turn = 1 - i;
        flag[i] = false;
      } else if (algorithm === 'peterson') {
        flag[i] = false;
      } else if (algorithm === 'lamport') {
        ticket[i] = 0;
        renderProcesses();
      }
    }

    async function remainderSection(i: number) {
      const delay = randomInt(400, 1000);
      await sleep(delay);
      states[i].status = 'idle';
      renderProcesses();
    }

    btnStart.addEventListener('click', () => {
      if (!running) runAlgorithm();
    });
    btnStop.addEventListener('click', stop);

    reset();

    (container as any).__cleanup = () => { stop(); };
  },
  destroy() {
    const ca = document.getElementById('content-area');
    if (ca && (ca as any).__cleanup) { (ca as any).__cleanup(); (ca as any).__cleanup = null; }
  }
} as ExperimentModule;
