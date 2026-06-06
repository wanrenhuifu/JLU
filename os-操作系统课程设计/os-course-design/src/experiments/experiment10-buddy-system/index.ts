import type { ExperimentModule } from '../../app.ts';
import { createElement, randomInt } from '../../common/utils.ts';
import { createCard, createButton, createInput, createSelect, createBadge } from '../../common/ui-kit.ts';

interface FreeBlock {
  start: number;
  size: number; // number of pages (2^group)
}

export default {
  name: '伙伴系统：内存分配释放',
  description: '伙伴堆算法模拟',
  init(container: HTMLElement) {
    container.innerHTML = '';
    let memorySize: 256 | 512 = 256;
    let pageSize: 1 | 2 | 4 = 4;
    let totalPages = 0;
    let freeLists: FreeBlock[][] = Array.from({ length: 10 }, () => []);
    let occupied: { start: number; group: number; pages: number }[] = [];

    const grid = createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'minmax(280px, 1fr) 2fr';
    grid.style.gap = '16px';

    const left = createElement('div');
    const { card: cfgCard, body: cfgBody } = createCard('内存配置');
    const memRow = createElement('div', 'form-row');
    memRow.innerHTML = `<span class="form-label">内存大小</span>`;
    const memSelect = createSelect([{ value: '256', label: '256 MB' }, { value: '512', label: '512 MB' }], '256');
    memRow.appendChild(memSelect);
    cfgBody.appendChild(memRow);

    const psRow = createElement('div', 'form-row');
    psRow.innerHTML = `<span class="form-label">页框大小</span>`;
    const psSelect = createSelect([{ value: '1', label: '1 KB' }, { value: '2', label: '2 KB' }, { value: '4', label: '4 KB' }], '4');
    psRow.appendChild(psSelect);
    cfgBody.appendChild(psRow);

    const infoText = createElement('div');
    infoText.style.fontSize = '12px';
    infoText.style.color = 'var(--text-secondary)';
    infoText.style.marginTop = '8px';
    cfgBody.appendChild(infoText);
    left.appendChild(cfgCard);

    const { card: opCard, body: opBody } = createCard('操作');
    const allocRow = createElement('div', 'form-row');
    allocRow.innerHTML = `<span class="form-label">申请页框</span>`;
    const allocInput = createInput({ type: 'number', value: '3', min: '1' }) as HTMLInputElement;
    allocInput.style.width = '80px';
    const btnAlloc = createButton('分配', 'primary');
    btnAlloc.classList.add('btn-sm');
    allocRow.append(allocInput, btnInput('页框'), btnAlloc);
    opBody.appendChild(allocRow);

    const freeRow = createElement('div', 'form-row');
    freeRow.innerHTML = `<span class="form-label">释放</span>`;
    const freeStart = createInput({ type: 'number', value: '0', min: '0' }) as HTMLInputElement;
    freeStart.style.width = '70px';
    freeStart.placeholder = '起始页';
    const freeGroup = createInput({ type: 'number', value: '0', min: '0', max: '9' }) as HTMLInputElement;
    freeGroup.style.width = '60px';
    freeGroup.placeholder = '块组';
    const btnFree = createButton('释放', 'danger');
    btnFree.classList.add('btn-sm');
    freeRow.append(freeStart, createElement('span', '', '页'), freeGroup, createElement('span', '', '组'), btnFree);
    opBody.appendChild(freeRow);

    const btnRandomOccupy = createButton('随机占用', 'secondary');
    const btnReset = createButton('重置', 'secondary');
    opBody.append(btnRandomOccupy, btnReset);

    const opResult = createElement('div');
    opResult.style.marginTop = '12px';
    opResult.style.fontSize = '13px';
    opBody.appendChild(opResult);
    left.appendChild(opCard);
    grid.appendChild(left);

    const right = createElement('div');
    const { card: listCard, body: listBody } = createCard('空闲区链表');
    const listsArea = createElement('div');
    listsArea.style.display = 'grid';
    listsArea.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
    listsArea.style.gap = '10px';
    listBody.appendChild(listsArea);
    right.appendChild(listCard);

    const { card: memCard, body: memBody } = createCard('内存位图 (每块=1页框)');
    const memBitmap = createElement('div');
    memBitmap.style.display = 'flex';
    memBitmap.style.flexWrap = 'wrap';
    memBitmap.style.gap = '2px';
    memBody.appendChild(memBitmap);
    right.appendChild(memCard);

    const { card: occCard, body: occBody } = createCard('已占用块');
    const occList = createElement('div');
    occList.style.display = 'flex';
    occList.style.flexWrap = 'wrap';
    occList.style.gap = '6px';
    occBody.appendChild(occList);
    right.appendChild(occCard);

    grid.appendChild(right);
    container.appendChild(grid);

    function btnInput(label: string) {
      return createElement('span', '', label);
    }

    function init() {
      memorySize = parseInt(memSelect.value) as 256 | 512;
      pageSize = parseInt(psSelect.value) as 1 | 2 | 4;
      const memBytes = memorySize * 1024 * 1024;
      const pageBytes = pageSize * 1024;
      totalPages = Math.ceil(memBytes / pageBytes);
      freeLists = Array.from({ length: 10 }, () => []);
      occupied = [];

      // Put all memory into largest possible block
      let remaining = totalPages;
      let start = 0;
      for (let g = 9; g >= 0; g--) {
        const blockSize = 1 << g;
        while (remaining >= blockSize) {
          freeLists[g].push({ start, size: blockSize });
          start += blockSize;
          remaining -= blockSize;
        }
      }
      infoText.textContent = `总页框: ${totalPages} | 页框大小: ${pageSize}KB`;
      render();
    }

    function allocate(requestPages: number): boolean {
      // Find smallest group that fits
      let group = 0;
      while ((1 << group) < requestPages && group < 10) group++;
      if (group >= 10) return false;

      // Find first available block at or above this group
      for (let g = group; g < 10; g++) {
        if (freeLists[g].length > 0) {
          const block = freeLists[g].shift()!;
          // Split down to needed group
          let curr = block;
          while (g > group) {
            g--;
            const half = { start: curr.start + (curr.size >> 1), size: curr.size >> 1 };
            curr = { start: curr.start, size: curr.size >> 1 };
            freeLists[g].push(half);
            freeLists[g].sort((a, b) => a.start - b.start);
          }
          occupied.push({ start: curr.start, group, pages: requestPages });
          occupied.sort((a, b) => a.start - b.start);
          return true;
        }
      }
      return false;
    }

    function free(startPage: number, group: number): boolean {
      const idx = occupied.findIndex(o => o.start === startPage && o.group === group);
      if (idx === -1) return false;
      occupied.splice(idx, 1);

      // Coalesce buddies
      let block: FreeBlock = { start: startPage, size: 1 << group };
      while (group < 9) {
        const buddySize = 1 << group;
        const buddyStart = (block.start % (buddySize * 2) === 0) ? block.start + buddySize : block.start - buddySize;
        const buddyIdx = freeLists[group].findIndex(b => b.start === buddyStart && b.size === buddySize);
        if (buddyIdx === -1) break;
        freeLists[group].splice(buddyIdx, 1);
        block.start = Math.min(block.start, buddyStart);
        block.size *= 2;
        group++;
      }
      freeLists[group].push(block);
      freeLists[group].sort((a, b) => a.start - b.start);
      return true;
    }

    function render() {
      listsArea.innerHTML = '';
      for (let g = 0; g < 10; g++) {
        const col = createElement('div');
        col.style.padding = '8px';
        col.style.borderRadius = 'var(--radius-sm)';
        col.style.background = 'var(--bg-page)';
        col.style.border = '1px solid var(--border)';
        const title = createElement('div', '', `块组 ${g} (${1 << g}页)`);
        title.style.fontSize = '12px';
        title.style.fontWeight = '600';
        title.style.marginBottom = '6px';
        title.style.color = freeLists[g].length > 0 ? 'var(--success)' : 'var(--text-tertiary)';
        col.appendChild(title);
        if (freeLists[g].length === 0) {
          const empty = createElement('div', '', '(空)');
          empty.style.fontSize = '11px';
          empty.style.color = 'var(--text-tertiary)';
          col.appendChild(empty);
        } else {
          freeLists[g].forEach(b => {
            const chip = createElement('div');
            chip.style.fontSize = '11px';
            chip.style.padding = '2px 0';
            chip.textContent = `[${b.start}..${b.start + b.size - 1}]`;
            col.appendChild(chip);
          });
        }
        listsArea.appendChild(col);
      }

      memBitmap.innerHTML = '';
      const occSet = new Set<number>();
      occupied.forEach(o => {
        for (let i = 0; i < (1 << o.group); i++) occSet.add(o.start + i);
      });
      const showCount = Math.min(totalPages, 128);
      for (let i = 0; i < showCount; i++) {
        const cell = createElement('div');
        cell.style.width = '16px';
        cell.style.height = '16px';
        cell.style.borderRadius = '2px';
        cell.style.background = occSet.has(i) ? 'var(--accent)' : 'var(--success)';
        cell.title = `页框 ${i}: ${occSet.has(i) ? '已占用' : '空闲'}`;
        memBitmap.appendChild(cell);
      }
      if (totalPages > showCount) {
        const more = createElement('span', '', `...共${totalPages}页`);
        more.style.fontSize = '11px';
        more.style.color = 'var(--text-tertiary)';
        memBitmap.appendChild(more);
      }

      occList.innerHTML = '';
      if (occupied.length === 0) {
        occList.appendChild(createElement('span', '', '(无)'));
        (occList.lastElementChild as HTMLElement).style.color = 'var(--text-tertiary)';
      } else {
        occupied.forEach(o => {
          const chip = createElement('span', 'badge badge-error');
          chip.textContent = `[${o.start}..${o.start + (1 << o.group) - 1}] G${o.group}`;
          occList.appendChild(chip);
        });
      }
    }

    function randomOccupy() {
      init();
      const count = randomInt(3, 6);
      for (let i = 0; i < count; i++) {
        const pages = randomInt(1, 16);
        allocate(pages);
      }
      render();
    }

    btnAlloc.addEventListener('click', () => {
      const pages = parseInt(allocInput.value) || 1;
      const ok = allocate(pages);
      opResult.innerHTML = '';
      opResult.appendChild(createBadge(ok ? `分配成功: ${pages}页` : '分配失败: 无足够空间', ok ? 'success' : 'error'));
      render();
    });

    btnFree.addEventListener('click', () => {
      const start = parseInt(freeStart.value) || 0;
      const group = parseInt(freeGroup.value) || 0;
      const ok = free(start, group);
      opResult.innerHTML = '';
      opResult.appendChild(createBadge(ok ? `释放成功: 页框${start} 组${group}` : '释放失败: 块不存在', ok ? 'success' : 'error'));
      render();
    });

    btnRandomOccupy.addEventListener('click', randomOccupy);
    btnReset.addEventListener('click', () => { init(); render(); });
    memSelect.addEventListener('change', () => { init(); render(); });
    psSelect.addEventListener('change', () => { init(); render(); });

    init();
    randomOccupy();
  },
  destroy() {}
} as ExperimentModule;
