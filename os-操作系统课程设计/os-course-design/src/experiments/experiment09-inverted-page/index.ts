import type { ExperimentModule } from '../../app.ts';
import { createElement, formatHex } from '../../common/utils.ts';
import { createCard, createButton, createSelect } from '../../common/ui-kit.ts';

interface InvertedPageEntry {
  index: number;
  pid: number;
  page: number;
  conflictCount: number;
  conflict: boolean;
  occupied: boolean;
}

interface ProcessInfo {
  pid: number;
  size: number;
  pages: number;
}

export default {
  name: '反置页表：杂凑页式管理',
  description: 'Hash技术与地址转换',
  init(container: HTMLElement) {
    container.innerHTML = '';
    let memorySize: 256 | 512 = 256;
    let pageSize: 1 | 2 | 4 = 4;
    let frameCount = 0;
    let table: (InvertedPageEntry | null)[] = [];
    let processes: ProcessInfo[] = [];

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

    const infoRow = createElement('div', 'form-row');
    infoRow.innerHTML = `<span class="form-label">页表信息</span>`;
    const infoText = createElement('span');
    infoText.style.fontSize = '12px';
    infoText.style.color = 'var(--text-secondary)';
    infoRow.appendChild(infoText);
    cfgBody.appendChild(infoRow);

    const btnGen = createButton('生成随机进程', 'primary');
    const btnAddr = createButton('随机逻辑地址', 'secondary');
    cfgBody.append(btnGen, btnAddr);
    left.appendChild(cfgCard);

    const { card: procCard, body: procBody } = createCard('进程列表');
    const procList = createElement('div');
    procList.style.display = 'flex';
    procList.style.flexDirection = 'column';
    procList.style.gap = '6px';
    procBody.appendChild(procList);
    left.appendChild(procCard);

    const { card: addrCard, body: addrBody } = createCard('地址转换');
    const addrResult = createElement('div');
    addrResult.style.fontSize = '13px';
    addrResult.style.lineHeight = '1.8';
    addrBody.appendChild(addrResult);
    left.appendChild(addrCard);
    grid.appendChild(left);

    const right = createElement('div');
    const { card: tableCard, body: tableBody } = createCard('反置页表 (非空项)');
    const tableWrap = createElement('div', 'table-wrap');
    const tableEl = createElement('table', 'table');
    tableEl.innerHTML = '<thead><tr><th>序号</th><th>进程号</th><th>逻辑页号</th><th>冲突计数</th><th>冲突</th><th>占用</th></tr></thead>';
    const tableTbody = createElement('tbody');
    tableEl.appendChild(tableTbody);
    tableWrap.appendChild(tableEl);
    tableBody.appendChild(tableWrap);
    right.appendChild(tableCard);
    grid.appendChild(right);
    container.appendChild(grid);

    function init() {
      memorySize = parseInt(memSelect.value) as 256 | 512;
      pageSize = parseInt(psSelect.value) as 1 | 2 | 4;
      const memBytes = memorySize * 1024 * 1024;
      const pageBytes = pageSize * 1024;
      frameCount = Math.ceil(memBytes / pageBytes);
      table = Array(frameCount).fill(null);
      processes = [];
      infoText.textContent = `页框数: ${frameCount} | 页表占空间: ${frameCount * 12} bytes (估算)`;
      addrResult.innerHTML = '';
      tableTbody.innerHTML = '';
      procList.innerHTML = '';
    }

    function hash(pid: number, page: number): number {
      return (pid * frameCount + page) % frameCount;
    }

    function allocateProcess(pid: number, sizeBytes: number) {
      const pages = Math.ceil(sizeBytes / (pageSize * 1024));
      const proc: ProcessInfo = { pid, size: sizeBytes, pages };
      processes.push(proc);

      for (let p = 0; p < pages; p++) {
        let idx = hash(pid, p);
        let conflictCount = 0;
        while (table[idx] !== null) {
          idx = (idx + 1) % frameCount;
          conflictCount++;
        }
        table[idx] = {
          index: idx,
          pid,
          page: p,
          conflictCount,
          conflict: conflictCount > 0,
          occupied: true,
        };
      }
      render();
    }

    function generateProcesses() {
      init();
      const procCount = Math.max(4, Math.floor(Math.random() * 4) + 4);
      let totalPages = 0;
      const maxPages = Math.floor(frameCount * 0.8);
      const tempProcs: { pid: number; pages: number }[] = [];

      for (let i = 0; i < procCount; i++) {
        const pages = Math.max(4, randomInt(4, Math.min(20, maxPages / procCount)));
        if (totalPages + pages > maxPages) break;
        tempProcs.push({ pid: i + 1, pages });
        totalPages += pages;
      }

      tempProcs.forEach(tp => {
        const sizeBytes = tp.pages * pageSize * 1024;
        allocateProcess(tp.pid, sizeBytes);
      });
    }

    function randomAddress() {
      if (processes.length === 0) return;
      const proc = processes[Math.floor(Math.random() * processes.length)];
      const maxAddr = proc.size;
      const logicalAddr = Math.floor(Math.random() * maxAddr);
      const pageBytes = pageSize * 1024;
      const pageNum = Math.floor(logicalAddr / pageBytes);
      const offset = logicalAddr % pageBytes;

      // Hash lookup
      let idx = hash(proc.pid, pageNum);
      let probeCount = 0;
      let found = false;
      const maxProbe = frameCount;
      while (probeCount < maxProbe) {
        const entry = table[idx];
        if (entry && entry.pid === proc.pid && entry.page === pageNum) {
          found = true;
          break;
        }
        if (entry === null) break;
        idx = (idx + 1) % frameCount;
        probeCount++;
      }

      const frameNum = found ? idx : -1;
      const physicalAddr = found ? frameNum * pageBytes + offset : -1;

      addrResult.innerHTML = `
        <div><strong>选定进程:</strong> PID=${proc.pid}, 逻辑空间=${proc.size} bytes (${proc.pages}页)</div>
        <div><strong>逻辑地址 L:</strong> ${formatHex(logicalAddr)}</div>
        <div><strong>逻辑页号:</strong> ${pageNum} | <strong>页内偏移:</strong> ${formatHex(offset)}</div>
        <div><strong>Hash(pid, p):</strong> (${proc.pid} × ${frameCount} + ${pageNum}) % ${frameCount} = ${hash(proc.pid, pageNum)}</div>
        <div><strong>探测次数:</strong> ${probeCount}</div>
        <div><strong>页框号:</strong> ${found ? frameNum : '未找到'}</div>
        <div><strong>物理地址:</strong> ${found ? formatHex(physicalAddr, 8) : 'N/A'}</div>
        ${!found ? '<div style="color:var(--error)">地址越界或页表项不存在</div>' : ''}
      `;
    }

    function render() {
      procList.innerHTML = '';
      processes.forEach(p => {
        const chip = createElement('div');
        chip.style.padding = '6px 10px';
        chip.style.borderRadius = 'var(--radius-sm)';
        chip.style.background = 'var(--bg-page)';
        chip.style.border = '1px solid var(--border)';
        chip.style.fontSize = '12px';
        chip.innerHTML = `<strong>PID=${p.pid}</strong> | ${p.size} bytes | ${p.pages}页`;
        procList.appendChild(chip);
      });

      tableTbody.innerHTML = '';
      table.forEach(entry => {
        if (!entry) return;
        const tr = createElement('tr');
        tr.innerHTML = `
          <td>${entry.index}</td>
          <td>${entry.pid}</td>
          <td>${entry.page}</td>
          <td>${entry.conflictCount}</td>
          <td>${entry.conflict ? '<span style="color:var(--warning)">是</span>' : '否'}</td>
          <td>${entry.occupied ? '<span style="color:var(--success)">占用</span>' : '空闲'}</td>
        `;
        tableTbody.appendChild(tr);
      });
    }

    function randomInt(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    memSelect.addEventListener('change', init);
    psSelect.addEventListener('change', init);
    btnGen.addEventListener('click', generateProcesses);
    btnAddr.addEventListener('click', randomAddress);

    init();
    generateProcesses();
  },
  destroy() {}
} as ExperimentModule;
