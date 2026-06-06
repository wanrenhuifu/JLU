import type { ExperimentModule } from '../../app.ts';
import { createElement, sleep, randomInt } from '../../common/utils.ts';
import { createCard, createButton, createInput, createBadge, createToolbar } from '../../common/ui-kit.ts';

interface Actor {
  id: number;
  type: 'reader' | 'writer';
  status: 'idle' | 'waiting' | 'active';
}

export default {
  name: '读者写者：写者优先',
  description: '信号量P/V操作同步',
  init(container: HTMLElement) {
    container.innerHTML = '';
    let running = false;
    let readersCount = 3;
    let writersCount = 2;
    let actors: Actor[] = [];
    let activeReaders = 0;
    let waitingReaders = 0;
    let waitingWriters = 0;
    let writerActive = false;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const grid = createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'minmax(280px, 1fr) 2fr';
    grid.style.gap = '16px';

    const left = createElement('div');
    const { card: ctrlCard, body: ctrlBody } = createCard('控制');
    const toolbar = createToolbar();
    const btnStart = createButton('▶ 开始', 'primary');
    const btnStop = createButton('⏹ 停止', 'danger');
    toolbar.append(btnStart, btnStop);
    ctrlBody.appendChild(toolbar);

    const rcRow = createElement('div', 'form-row');
    rcRow.innerHTML = `<span class="form-label">读者数</span>`;
    const rcInput = createInput({ type: 'number', value: '3', min: '1', max: '8' });
    rcRow.appendChild(rcInput);
    ctrlBody.appendChild(rcRow);

    const wcRow = createElement('div', 'form-row');
    wcRow.innerHTML = `<span class="form-label">写者数</span>`;
    const wcInput = createInput({ type: 'number', value: '2', min: '1', max: '5' });
    wcRow.appendChild(wcInput);
    ctrlBody.appendChild(wcRow);

    const speedRow = createElement('div', 'form-row');
    speedRow.innerHTML = `<span class="form-label">速度</span>`;
    const speedInput = createInput({ type: 'range', value: '800' }) as HTMLInputElement;
    speedInput.min = '200';
    speedInput.max = '2000';
    speedInput.style.flex = '1';
    speedRow.appendChild(speedInput);
    ctrlBody.appendChild(speedRow);

    const semDisplay = createElement('div');
    semDisplay.style.marginTop = '12px';
    semDisplay.style.fontSize = '12px';
    semDisplay.style.fontFamily = 'monospace';
    semDisplay.style.lineHeight = '1.8';
    ctrlBody.appendChild(semDisplay);
    left.appendChild(ctrlCard);
    grid.appendChild(left);

    const right = createElement('div');
    const { card: dbCard, body: dbBody } = createCard('共享数据区');
    const dbZone = createElement('div');
    dbZone.style.height = '120px';
    dbZone.style.display = 'flex';
    dbZone.style.alignItems = 'center';
    dbZone.style.justifyContent = 'center';
    dbZone.style.borderRadius = 'var(--radius-lg)';
    dbZone.style.border = '3px solid var(--border)';
    dbZone.style.background = 'var(--bg-page)';
    dbZone.style.transition = 'all 0.3s ease';
    dbZone.innerHTML = `<div style="font-size:16px;font-weight:600;color:var(--text-secondary)">📁 数据区空闲</div>`;
    dbBody.appendChild(dbZone);
    right.appendChild(dbCard);

    const { card: waitCard, body: waitBody } = createCard('等待队列');
    const waitArea = createElement('div');
    waitArea.style.display = 'flex';
    waitArea.style.gap = '12px';
    waitArea.style.flexWrap = 'wrap';
    waitBody.appendChild(waitArea);
    right.appendChild(waitCard);

    const { card: procCard, body: procBody } = createCard('进程状态');
    const procArea = createElement('div');
    procArea.style.display = 'grid';
    procArea.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
    procArea.style.gap = '10px';
    procBody.appendChild(procArea);
    right.appendChild(procCard);

    const { card: logCard, body: logBody } = createCard('操作日志');
    const logArea = createElement('div', 'log-area');
    logArea.style.maxHeight = '120px';
    logBody.appendChild(logArea);
    right.appendChild(logCard);

    grid.appendChild(right);
    container.appendChild(grid);

    function addLog(msg: string, type?: 'success' | 'warning' | 'error' | 'info') {
      const entry = createElement('div', 'log-entry', msg);
      if (type) {
        const colors = { success: 'var(--success)', warning: 'var(--warning)', error: 'var(--error)', info: 'var(--info)' };
        entry.style.color = colors[type];
      }
      logArea.appendChild(entry);
      logArea.scrollTop = logArea.scrollHeight;
    }

    function reset() {
      stop();
      readersCount = parseInt(rcInput.value) || 3;
      writersCount = parseInt(wcInput.value) || 2;
      actors = [];
      for (let i = 0; i < readersCount; i++) actors.push({ id: i, type: 'reader', status: 'idle' });
      for (let i = 0; i < writersCount; i++) actors.push({ id: i + readersCount, type: 'writer', status: 'idle' });
      activeReaders = 0;
      waitingReaders = 0;
      waitingWriters = 0;
      writerActive = false;
      render();
    }

    function stop() {
      running = false;
      timers.forEach(t => clearTimeout(t));
      timers = [];
    }

    function render() {
      // Update semaphore display
      semDisplay.innerHTML = `
        <div>mutex (互斥信号量): ${writerActive || activeReaders > 0 ? '0' : '1'}</div>
        <div>readCount: ${activeReaders}</div>
        <div>writeMutex: ${waitingWriters > 0 || writerActive ? '0' : '1'}</div>
        <div>readerMutex: ${waitingReaders > 0 ? '0' : '1'}</div>
      `;

      // Update DB zone
      if (writerActive) {
        dbZone.style.borderColor = 'var(--error)';
        dbZone.style.background = 'var(--error-bg)';
        dbZone.innerHTML = `<div style="font-size:16px;font-weight:600;color:var(--error)">✏️ 写者正在写入</div>`;
      } else if (activeReaders > 0) {
        dbZone.style.borderColor = 'var(--success)';
        dbZone.style.background = 'var(--success-bg)';
        dbZone.innerHTML = `<div style="font-size:16px;font-weight:600;color:var(--success)">👁️ ${activeReaders} 个读者正在读取</div>`;
      } else {
        dbZone.style.borderColor = 'var(--border)';
        dbZone.style.background = 'var(--bg-page)';
        dbZone.innerHTML = `<div style="font-size:16px;font-weight:600;color:var(--text-secondary)">📁 数据区空闲</div>`;
      }

      // Update wait area
      waitArea.innerHTML = '';
      const waitReaders = actors.filter(a => a.type === 'reader' && a.status === 'waiting');
      const waitWriters = actors.filter(a => a.type === 'writer' && a.status === 'waiting');
      if (waitReaders.length > 0) {
        const group = createElement('div');
        group.innerHTML = `<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px">读等待 (${waitReaders.length})</div>`;
        const chips = createElement('div');
        chips.style.display = 'flex';
        chips.style.gap = '4px';
        waitReaders.forEach(a => {
          const chip = createElement('span', 'badge badge-success', `R${a.id + 1}`);
          chips.appendChild(chip);
        });
        group.appendChild(chips);
        waitArea.appendChild(group);
      }
      if (waitWriters.length > 0) {
        const group = createElement('div');
        group.innerHTML = `<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px">写等待 (${waitWriters.length})</div>`;
        const chips = createElement('div');
        chips.style.display = 'flex';
        chips.style.gap = '4px';
        waitWriters.forEach(a => {
          const chip = createElement('span', 'badge badge-error', `W${a.id - readersCount + 1}`);
          chips.appendChild(chip);
        });
        group.appendChild(chips);
        waitArea.appendChild(group);
      }
      if (waitReaders.length === 0 && waitWriters.length === 0) {
        waitArea.appendChild(createElement('span', '', '无等待进程'));
        (waitArea.lastElementChild as HTMLElement).style.color = 'var(--text-tertiary)';
      }

      // Update process cards
      procArea.innerHTML = '';
      actors.forEach(a => {
        const card = createElement('div');
        card.style.padding = '10px';
        card.style.borderRadius = 'var(--radius-md)';
        card.style.border = '1px solid var(--border)';
        card.style.textAlign = 'center';
        card.style.transition = 'all 0.3s ease';
        const name = a.type === 'reader' ? `读者 ${a.id + 1}` : `写者 ${a.id - readersCount + 1}`;
        let badgeText = '空闲';
        let badgeType: 'success' | 'warning' | 'error' | 'info' = 'info';
        if (a.status === 'waiting') { badgeText = '等待'; badgeType = 'warning'; card.style.borderColor = 'var(--warning)'; }
        if (a.status === 'active') { badgeText = '运行中'; badgeType = a.type === 'reader' ? 'success' : 'error'; card.style.borderColor = a.type === 'reader' ? 'var(--success)' : 'var(--error)'; card.style.background = a.type === 'reader' ? 'var(--success-bg)' : 'var(--error-bg)'; }
        card.innerHTML = `<div style="font-weight:600;margin-bottom:4px">${name}</div>`;
        card.appendChild(createBadge(badgeText, badgeType));
        procArea.appendChild(card);
      });
    }

    async function simulateActor(actor: Actor) {
      while (running) {
        // Try to enter
        if (actor.type === 'reader') {
          if (writerActive || waitingWriters > 0) {
            actor.status = 'waiting';
            waitingReaders++;
            render();
            addLog(`${actor.id + 1}号读者等待（写者优先）`, 'warning');
            while (running && (writerActive || waitingWriters > 0)) await sleep(200);
            waitingReaders--;
          }
          if (!running) break;
          actor.status = 'active';
          activeReaders++;
          render();
          addLog(`${actor.id + 1}号读者开始读取`, 'success');
          await sleep(randomInt(1000, 2500));
          if (!running) break;
          activeReaders--;
          actor.status = 'idle';
          render();
          addLog(`${actor.id + 1}号读者结束读取`);
        } else {
          if (writerActive || activeReaders > 0) {
            actor.status = 'waiting';
            waitingWriters++;
            render();
            addLog(`写者${actor.id - readersCount + 1}等待`, 'warning');
            while (running && (writerActive || activeReaders > 0)) await sleep(200);
            waitingWriters--;
          }
          if (!running) break;
          actor.status = 'active';
          writerActive = true;
          render();
          addLog(`写者${actor.id - readersCount + 1}开始写入`, 'error');
          await sleep(randomInt(1200, 3000));
          if (!running) break;
          writerActive = false;
          actor.status = 'idle';
          render();
          addLog(`写者${actor.id - readersCount + 1}结束写入`);
        }
        await sleep(randomInt(300, 800));
      }
    }

    async function start() {
      if (running) return;
      reset();
      running = true;
      actors.forEach(a => simulateActor(a));
    }

    btnStart.addEventListener('click', start);
    btnStop.addEventListener('click', stop);
    rcInput.addEventListener('change', reset);
    wcInput.addEventListener('change', reset);

    reset();

    (container as any).__cleanup = () => { stop(); };
  },
  destroy() {
    const ca = document.getElementById('content-area');
    if (ca && (ca as any).__cleanup) { (ca as any).__cleanup(); (ca as any).__cleanup = null; }
  }
} as ExperimentModule;
