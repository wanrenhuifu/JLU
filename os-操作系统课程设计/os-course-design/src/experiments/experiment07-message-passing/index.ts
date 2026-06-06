import type { ExperimentModule } from '../../app.ts';
import { createElement, sleep, randomInt } from '../../common/utils.ts';
import { createCard, createButton, createInput, createToolbar } from '../../common/ui-kit.ts';

interface Buffer {
  id: number;
  content: string;
  next: number | null;
}

export default {
  name: '消息通信：缓冲技术',
  description: '发送/接收命令模拟',
  init(container: HTMLElement) {
    container.innerHTML = '';
    let running = false;
    let poolSize = 6;
    // let msgSize = 16; // configurable placeholder
    let pool: (Buffer | null)[] = [];
    let freeList: number | null = 0;
    let msgQueueHead: number | null = null;
    let msgQueueTail: number | null = null;
    let mutex = 1;
    let empty = 0;
    let full = 0;
    let senders = 2;
    let receivers = 2;
    let logEntries: string[] = [];

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

    const psRow = createElement('div', 'form-row');
    psRow.innerHTML = `<span class="form-label">缓冲池大小</span>`;
    const psInput = createInput({ type: 'number', value: '6', min: '3', max: '12' });
    psRow.appendChild(psInput);
    ctrlBody.appendChild(psRow);

    const snRow = createElement('div', 'form-row');
    snRow.innerHTML = `<span class="form-label">发送进程</span>`;
    const snInput = createInput({ type: 'number', value: '2', min: '1', max: '4' });
    snRow.appendChild(snInput);
    ctrlBody.appendChild(snRow);

    const rnRow = createElement('div', 'form-row');
    rnRow.innerHTML = `<span class="form-label">接收进程</span>`;
    const rnInput = createInput({ type: 'number', value: '2', min: '1', max: '4' });
    rnRow.appendChild(rnInput);
    ctrlBody.appendChild(rnRow);

    const semDisplay = createElement('div');
    semDisplay.style.marginTop = '12px';
    semDisplay.style.fontSize = '12px';
    semDisplay.style.fontFamily = 'monospace';
    semDisplay.style.lineHeight = '1.8';
    ctrlBody.appendChild(semDisplay);
    left.appendChild(ctrlCard);
    grid.appendChild(left);

    const right = createElement('div');

    const { card: poolCard, body: poolBody } = createCard('缓冲池');
    const poolGrid = createElement('div');
    poolGrid.style.display = 'grid';
    poolGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(80px, 1fr))';
    poolGrid.style.gap = '8px';
    poolBody.appendChild(poolGrid);
    right.appendChild(poolCard);

    const { card: msgCard, body: msgBody } = createCard('消息链缓冲区');
    const msgChain = createElement('div');
    msgChain.style.display = 'flex';
    msgChain.style.alignItems = 'center';
    msgChain.style.gap = '8px';
    msgChain.style.minHeight = '50px';
    msgChain.style.padding = '10px';
    msgChain.style.background = 'var(--bg-page)';
    msgChain.style.borderRadius = 'var(--radius-md)';
    msgChain.style.border = '1px dashed var(--border)';
    msgBody.appendChild(msgChain);
    right.appendChild(msgCard);

    const { card: logCard, body: logBody } = createCard('操作日志');
    const logArea = createElement('div', 'log-area');
    logArea.style.maxHeight = '180px';
    logBody.appendChild(logArea);
    right.appendChild(logCard);

    grid.appendChild(right);
    container.appendChild(grid);

    function initPool() {
      poolSize = parseInt(psInput.value) || 6;
      senders = parseInt(snInput.value) || 2;
      receivers = parseInt(rnInput.value) || 2;
      pool = Array.from({ length: poolSize }, (_, i) => ({
        id: i,
        content: '',
        next: i < poolSize - 1 ? i + 1 : null,
      }));
      freeList = 0;
      msgQueueHead = null;
      msgQueueTail = null;
      mutex = 1;
      empty = poolSize;
      full = 0;
      logEntries = [];
      render();
    }

    function render() {
      // Semaphores
      semDisplay.innerHTML = `
        <div>mutex (互斥): ${mutex > 0 ? '1 (可用)' : '0 (占用)'}</div>
        <div>empty (空缓冲): ${empty}</div>
        <div>full (满缓冲): ${full}</div>
      `;

      // Pool grid
      poolGrid.innerHTML = '';
      pool.forEach((buf, i) => {
        const cell = createElement('div');
        cell.style.padding = '8px';
        cell.style.borderRadius = 'var(--radius-sm)';
        cell.style.border = '1px solid var(--border)';
        cell.style.textAlign = 'center';
        cell.style.fontSize = '11px';
        const inFree = isInFreeList(i);
        const inMsg = isInMsgQueue(i);
        if (inMsg) {
          cell.style.background = 'var(--accent-light)';
          cell.style.borderColor = 'var(--accent)';
          cell.innerHTML = `<div style="font-weight:600;color:var(--accent)">Buf${i}</div><div>${buf?.content || ''}</div>`;
        } else if (inFree) {
          cell.style.background = 'var(--success-bg)';
          cell.style.borderColor = 'var(--success)';
          cell.innerHTML = `<div style="font-weight:600;color:var(--success)">Buf${i}</div><div style="color:var(--text-tertiary)">空闲</div>`;
        } else {
          cell.style.background = 'var(--bg-card)';
          cell.innerHTML = `<div style="color:var(--text-tertiary)">Buf${i}</div><div>未用</div>`;
        }
        poolGrid.appendChild(cell);
      });

      // Message chain
      msgChain.innerHTML = '';
      let curr = msgQueueHead;
      if (curr === null) {
        msgChain.appendChild(createElement('span', '', '(空链)'));
        (msgChain.lastElementChild as HTMLElement).style.color = 'var(--text-tertiary)';
      } else {
        while (curr !== null) {
          const node = createElement('div');
          node.style.padding = '6px 10px';
          node.style.borderRadius = 'var(--radius-sm)';
          node.style.background = 'var(--accent-light)';
          node.style.border = '1px solid var(--accent)';
          node.style.fontSize = '11px';
          node.innerHTML = `<div style="font-weight:600">Buf${curr}</div><div>${pool[curr]?.content}</div>`;
          msgChain.appendChild(node);
          curr = pool[curr]?.next ?? null;
          if (curr !== null) {
            const arrow = createElement('span', '', '→');
            arrow.style.color = 'var(--text-tertiary)';
            msgChain.appendChild(arrow);
          }
        }
      }

      // Logs
      logArea.innerHTML = '';
      logEntries.slice(-30).forEach(entry => {
        logArea.appendChild(createElement('div', 'log-entry', entry));
      });
      logArea.scrollTop = logArea.scrollHeight;
    }

    function isInFreeList(idx: number): boolean {
      let curr = freeList;
      while (curr !== null) {
        if (curr === idx) return true;
        curr = pool[curr]?.next ?? null;
      }
      return false;
    }

    function isInMsgQueue(idx: number): boolean {
      let curr = msgQueueHead;
      while (curr !== null) {
        if (curr === idx) return true;
        curr = pool[curr]?.next ?? null;
      }
      return false;
    }

    function p(_bufId: number, sem: { value: number }) {
      sem.value--;
    }

    function v(_bufId: number, sem: { value: number }) {
      sem.value++;
    }

    async function p_send(senderId: number) {
      const m = { value: empty };
      p(senderId, m);
      empty = m.value;
      if (m.value < 0) {
        logEntries.push(`发送者${senderId} 等待空缓冲`);
        render();
        while (empty <= 0 && running) await sleep(200);
      }
      if (!running) return;

      const m2 = { value: mutex };
      p(senderId, m2);
      mutex = m2.value;

      // Allocate from free list
      if (freeList !== null) {
        const bufId = freeList;
        freeList = pool[bufId]?.next ?? null;
        pool[bufId]!.content = `S${senderId}:${randomInt(100, 999)}`;
        pool[bufId]!.next = null;

        // Insert into msg queue
        if (msgQueueTail === null) {
          msgQueueHead = bufId;
          msgQueueTail = bufId;
        } else {
          pool[msgQueueTail]!.next = bufId;
          msgQueueTail = bufId;
        }
        logEntries.push(`发送者${senderId} → 缓冲${bufId}: ${pool[bufId]!.content}`);
      }

      v(senderId, { value: mutex });
      mutex++;
      v(senderId, { value: full });
      full++;
      render();
    }

    async function p_receive(receiverId: number) {
      const m = { value: full };
      p(receiverId, m);
      full = m.value;
      if (m.value < 0) {
        logEntries.push(`接收者${receiverId} 等待消息`);
        render();
        while (full <= 0 && running) await sleep(200);
      }
      if (!running) return;

      const m2 = { value: mutex };
      p(receiverId, m2);
      mutex = m2.value;

      // Remove from msg queue
      if (msgQueueHead !== null) {
        const bufId = msgQueueHead;
        msgQueueHead = pool[bufId]?.next ?? null;
        if (msgQueueHead === null) msgQueueTail = null;
        const content = pool[bufId]!.content;
        pool[bufId]!.content = '';
        pool[bufId]!.next = freeList;
        freeList = bufId;
        logEntries.push(`接收者${receiverId} ← 缓冲${bufId}: ${content}`);
      }

      v(receiverId, { value: mutex });
      mutex++;
      v(receiverId, { value: empty });
      empty++;
      render();
    }

    async function simulateSender(id: number) {
      while (running) {
        await sleep(randomInt(800, 2000));
        if (!running) break;
        await p_send(id);
      }
    }

    async function simulateReceiver(id: number) {
      while (running) {
        await sleep(randomInt(1000, 2500));
        if (!running) break;
        await p_receive(id);
      }
    }

    function start() {
      if (running) return;
      initPool();
      running = true;
      for (let i = 0; i < senders; i++) simulateSender(i);
      for (let i = 0; i < receivers; i++) simulateReceiver(i);
    }

    function stop() {
      running = false;
    }

    btnStart.addEventListener('click', start);
    btnStop.addEventListener('click', stop);
    psInput.addEventListener('change', initPool);
    snInput.addEventListener('change', initPool);
    rnInput.addEventListener('change', initPool);

    initPool();

    (container as any).__cleanup = () => { stop(); };
  },
  destroy() {
    const ca = document.getElementById('content-area');
    if (ca && (ca as any).__cleanup) { (ca as any).__cleanup(); (ca as any).__cleanup = null; }
  }
} as ExperimentModule;
