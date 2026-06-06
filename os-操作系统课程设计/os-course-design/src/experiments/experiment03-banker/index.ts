import type { ExperimentModule } from '../../app.ts';
import { createElement } from '../../common/utils.ts';
import { createCard, createButton, createInput, createBadge } from '../../common/ui-kit.ts';

export default {
  name: '死锁避免：银行家算法',
  description: '安全性检测与资源分配',
  init(container: HTMLElement) {
    container.innerHTML = '';

    let n = 4; // processes
    let m = 3; // resources
    let Available: number[] = [3, 3, 2];
    let Max: number[][] = [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
    ];
    let Allocation: number[][] = [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
    ];

    const grid = createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
    grid.style.gap = '16px';

    // Build matrix card
    function buildMatrixCard(title: string, data: number[][], editable = false): { card: HTMLElement; getData: () => number[][] } {
      const { card, body } = createCard(title);
      const table = createElement('table', 'table');
      const thead = createElement('thead');
      const trh = createElement('tr');
      trh.appendChild(createElement('th', '', '进程'));
      for (let j = 0; j < m; j++) trh.appendChild(createElement('th', '', `R${j}`));
      thead.appendChild(trh);
      table.appendChild(thead);
      const tbody = createElement('tbody');
      const inputs: HTMLInputElement[][] = [];
      data.forEach((row, i) => {
        const tr = createElement('tr');
        tr.appendChild(createElement('td', '', `P${i}`));
        const rowInputs: HTMLInputElement[] = [];
        row.forEach((v, _j) => {
          const td = createElement('td');
          if (editable) {
            const inp = createInput({ type: 'number', value: String(v), min: '0' }) as HTMLInputElement;
            inp.style.width = '50px';
            td.appendChild(inp);
            rowInputs.push(inp);
          } else {
            td.textContent = String(v);
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
        if (editable) inputs.push(rowInputs);
      });
      table.appendChild(tbody);
      body.appendChild(table);
      return {
        card,
        getData: () => inputs.map(row => row.map(inp => parseInt(inp.value) || 0)),
      };
    }

    const { card: allocCard, getData: getAlloc } = buildMatrixCard('Allocation (已分配)', Allocation, true);
    const { card: maxCard, getData: getMax } = buildMatrixCard('Max (最大需求)', Max, true);

    // Available card
    const { card: availCard, body: availBody } = createCard('Available (可用资源)');
    const availRow = createElement('div');
    availRow.style.display = 'flex';
    availRow.style.gap = '8px';
    const availInputs: HTMLInputElement[] = [];
    Available.forEach((v, i) => {
      const inp = createInput({ type: 'number', value: String(v), min: '0' }) as HTMLInputElement;
      inp.style.width = '60px';
      availRow.appendChild(createElement('span', '', `R${i}:`));
      availRow.appendChild(inp);
      availInputs.push(inp);
    });
    availBody.appendChild(availRow);

    // Need matrix display
    const { card: needCard, body: needBody } = createCard('Need (需求矩阵 = Max - Allocation)');
    const needTable = createElement('table', 'table');
    needBody.appendChild(needTable);

    // Controls
    const { card: ctrlCard, body: ctrlBody } = createCard('操作');
    const toolbar = createElement('div', 'toolbar');
    const btnUpdate = createButton('更新数据', 'secondary');
    const btnSafe = createButton('安全性检测', 'primary');
    toolbar.append(btnUpdate, btnSafe);
    ctrlBody.appendChild(toolbar);

    const reqRow = createElement('div', 'form-row');
    reqRow.innerHTML = `<span class="form-label">请求</span>`;
    const reqProc = createInput({ type: 'number', value: '0', min: '0' }) as HTMLInputElement;
    reqProc.style.width = '50px';
    reqProc.placeholder = '进程';
    const reqResInputs: HTMLInputElement[] = [];
    reqRow.appendChild(createElement('span', '', 'P'));
    reqRow.appendChild(reqProc);
    for (let j = 0; j < m; j++) {
      const inp = createInput({ type: 'number', value: '1', min: '0' }) as HTMLInputElement;
      inp.style.width = '50px';
      reqRow.appendChild(createElement('span', '', `R${j}:`));
      reqRow.appendChild(inp);
      reqResInputs.push(inp);
    }
    const btnReq = createButton('资源请求', 'primary');
    reqRow.appendChild(btnReq);
    ctrlBody.appendChild(reqRow);

    const resultArea = createElement('div');
    resultArea.style.marginTop = '12px';
    ctrlBody.appendChild(resultArea);

    // Safe sequences log
    const { card: logCard, body: logBody } = createCard('安全序列结果');
    const logArea = createElement('div', 'log-area');
    logBody.appendChild(logArea);

    function updateData() {
      Allocation = getAlloc();
      Max = getMax();
      Available = availInputs.map(inp => parseInt(inp.value) || 0);
      renderNeed();
      resultArea.innerHTML = '';
      logArea.innerHTML = '';
    }

    function renderNeed() {
      needTable.innerHTML = '';
      const thead = createElement('thead');
      const trh = createElement('tr');
      trh.appendChild(createElement('th', '', '进程'));
      for (let j = 0; j < m; j++) trh.appendChild(createElement('th', '', `R${j}`));
      thead.appendChild(trh);
      needTable.appendChild(thead);
      const tbody = createElement('tbody');
      for (let i = 0; i < n; i++) {
        const tr = createElement('tr');
        tr.appendChild(createElement('td', '', `P${i}`));
        for (let j = 0; j < m; j++) {
          const need = Max[i][j] - Allocation[i][j];
          const td = createElement('td', '', String(need));
          if (need < 0) td.style.color = 'var(--error)';
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      needTable.appendChild(tbody);
    }

    function checkSafe(): { safe: boolean; sequences: number[][]; work: number[]; finish: boolean[] } {
      const Work = [...Available];
      const Finish = Array(n).fill(false);
      const sequences: number[][] = [];

      function dfs(path: number[]) {
        if (path.length === n) {
          sequences.push([...path]);
          return;
        }
        for (let i = 0; i < n; i++) {
          if (Finish[i]) continue;
          let canRun = true;
          for (let j = 0; j < m; j++) {
            if (Max[i][j] - Allocation[i][j] > Work[j]) { canRun = false; break; }
          }
          if (canRun) {
            Finish[i] = true;
            const oldWork = [...Work];
            for (let j = 0; j < m; j++) Work[j] += Allocation[i][j];
            dfs([...path, i]);
            Work.splice(0, m, ...oldWork);
            Finish[i] = false;
          }
        }
      }

      dfs([]);
      return { safe: sequences.length > 0, sequences, work: Work, finish: Finish };
    }

    function doSafeCheck() {
      updateData();
      const { safe, sequences } = checkSafe();
      resultArea.innerHTML = '';
      if (safe) {
        resultArea.appendChild(createBadge('系统是安全状态', 'success'));
      } else {
        resultArea.appendChild(createBadge('系统处于不安全状态！', 'error'));
      }
      logArea.innerHTML = '';
      if (sequences.length > 0) {
        const title = createElement('div', '', `找到 ${sequences.length} 个安全序列:`);
        title.style.marginBottom = '8px';
        title.style.fontWeight = '600';
        logArea.appendChild(title);
        sequences.forEach((seq, idx) => {
          const entry = createElement('div', 'log-entry');
          entry.textContent = `${idx + 1}. <${seq.map(i => `P${i}`).join(', ')}>`;
          logArea.appendChild(entry);
        });
      } else {
        logArea.appendChild(createElement('div', 'log-entry', '不存在安全序列'));
      }
    }

    function doRequest() {
      updateData();
      const pi = parseInt(reqProc.value) || 0;
      if (pi < 0 || pi >= n) {
        resultArea.innerHTML = '';
        resultArea.appendChild(createBadge('进程号无效', 'error'));
        return;
      }
      const request = reqResInputs.map(inp => parseInt(inp.value) || 0);

      // Check Request <= Need
      for (let j = 0; j < m; j++) {
        if (request[j] > Max[pi][j] - Allocation[pi][j]) {
          resultArea.innerHTML = '';
          resultArea.appendChild(createBadge('请求超过声明的最大需求！', 'error'));
          return;
        }
      }
      // Check Request <= Available
      for (let j = 0; j < m; j++) {
        if (request[j] > Available[j]) {
          resultArea.innerHTML = '';
          resultArea.appendChild(createBadge('请求超过可用资源，进程需等待', 'warning'));
          return;
        }
      }

      // Try allocation
      const oldAvail = [...Available];
      const oldAlloc = Allocation.map(r => [...r]);
      for (let j = 0; j < m; j++) {
        Available[j] -= request[j];
        Allocation[pi][j] += request[j];
      }
      const { safe } = checkSafe();
      if (safe) {
        resultArea.innerHTML = '';
        resultArea.appendChild(createBadge(`请求可接受，分配后系统仍安全`, 'success'));
        // Update inputs
        availInputs.forEach((inp, j) => inp.value = String(Available[j]));
        renderNeed();
        // Show new Available
        const info = createElement('div', '', `新 Available: [${Available.join(', ')}]`);
        info.style.marginTop = '8px';
        info.style.fontSize = '12px';
        resultArea.appendChild(info);
      } else {
        // Rollback
        Available = oldAvail;
        Allocation = oldAlloc;
        resultArea.innerHTML = '';
        resultArea.appendChild(createBadge('分配后系统进入不安全状态，请求被拒绝', 'error'));
      }
    }

    btnUpdate.addEventListener('click', updateData);
    btnSafe.addEventListener('click', doSafeCheck);
    btnReq.addEventListener('click', doRequest);

    // Layout
    const topRow = createElement('div');
    topRow.style.display = 'grid';
    topRow.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
    topRow.style.gap = '16px';
    topRow.append(allocCard, maxCard);

    const midRow = createElement('div');
    midRow.style.display = 'grid';
    midRow.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
    midRow.style.gap = '16px';
    midRow.append(availCard, needCard);

    const bottomRow = createElement('div');
    bottomRow.style.display = 'grid';
    bottomRow.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
    bottomRow.style.gap = '16px';
    bottomRow.append(ctrlCard, logCard);

    container.append(topRow, midRow, bottomRow);
    updateData();
  },
  destroy() {}
} as ExperimentModule;
