import type { ExperimentModule } from '../../app.ts';
import { createElement, formatHex } from '../../common/utils.ts';
import { createCard, createButton, createInput, createSelect } from '../../common/ui-kit.ts';
import { runReplacement, generateAccessSequence } from './algorithm.ts';
import type { StepResult, Algorithm } from './algorithm.ts';

export default {
  name: '页面置换：工作集模型',
  description: 'FIFO/LRU/NUR/CLOCK算法',
  init(container: HTMLElement) {
    container.innerHTML = '';
    let results: StepResult[] = [];
    let currentStep = 0;
    let animating = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const grid = createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'minmax(280px, 1fr) 2fr';
    grid.style.gap = '16px';

    // Left controls
    const left = createElement('div');
    const { card: ctrlCard, body: ctrlBody } = createCard('参数设置');
    const algoRow = createElement('div', 'form-row');
    algoRow.innerHTML = `<span class="form-label">算法</span>`;
    const algoSelect = createSelect([
      { value: 'FIFO', label: 'FIFO' },
      { value: 'LRU', label: 'LRU' },
      { value: 'NUR', label: 'NUR' },
      { value: 'CLOCK', label: 'CLOCK' },
    ], 'FIFO');
    algoRow.appendChild(algoSelect);
    ctrlBody.appendChild(algoRow);

    const frameRow = createElement('div', 'form-row');
    frameRow.innerHTML = `<span class="form-label">页框数</span>`;
    const frameInput = createInput({ type: 'number', value: '3', min: '1', max: '8' });
    frameRow.appendChild(frameInput);
    ctrlBody.appendChild(frameRow);

    const pageRow = createElement('div', 'form-row');
    pageRow.innerHTML = `<span class="form-label">逻辑页数</span>`;
    const pageInput = createInput({ type: 'number', value: '8', min: '4', max: '16' });
    pageRow.appendChild(pageInput);
    ctrlBody.appendChild(pageRow);

    const seqRow = createElement('div', 'form-row');
    seqRow.innerHTML = `<span class="form-label">序列长度</span>`;
    const seqInput = createInput({ type: 'number', value: '16', min: '8', max: '32' });
    seqRow.appendChild(seqInput);
    ctrlBody.appendChild(seqRow);

    const btnGen = createButton('生成序列', 'secondary');
    const btnRun = createButton('运行算法', 'primary');
    const btnStep = createButton('单步', 'secondary');
    const btnAuto = createButton('自动播放', 'primary');
    const btnStop = createButton('停止', 'danger');
    const toolbar = createElement('div', 'toolbar');
    toolbar.append(btnGen, btnRun, btnStep, btnAuto, btnStop);
    ctrlBody.appendChild(toolbar);

    const statsEl = createElement('div');
    statsEl.style.marginTop = '12px';
    statsEl.style.fontSize = '13px';
    ctrlBody.appendChild(statsEl);
    left.appendChild(ctrlCard);

    // Sequence display
    const { card: seqCard, body: seqBody } = createCard('访问序列');
    const seqDisplay = createElement('div');
    seqDisplay.style.display = 'flex';
    seqDisplay.style.flexWrap = 'wrap';
    seqDisplay.style.gap = '6px';
    seqBody.appendChild(seqDisplay);
    left.appendChild(seqCard);
    grid.appendChild(left);

    // Right visualization
    const right = createElement('div');
    const { card: visCard, body: visBody } = createCard('页框状态');
    const frameVisual = createElement('div');
    frameVisual.style.display = 'flex';
    frameVisual.style.gap = '12px';
    frameVisual.style.marginBottom = '16px';
    visBody.appendChild(frameVisual);

    const { card: tableCard, body: tableBody } = createCard('访问结果');
    const resultTable = createElement('table', 'table');
    const thead = createElement('thead');
    thead.innerHTML = '<tr><th>步骤</th><th>逻辑地址</th><th>页号</th><th>命中</th><th>淘汰页</th><th>物理地址</th></tr>';
    resultTable.appendChild(thead);
    const tbody = createElement('tbody');
    resultTable.appendChild(tbody);
    tableBody.appendChild(resultTable);

    right.append(visCard, tableCard);
    grid.appendChild(right);
    container.appendChild(grid);

    let sequence: number[] = [];

    function generate() {
      const pageCount = parseInt(pageInput.value) || 8;
      const len = parseInt(seqInput.value) || 16;
      sequence = generateAccessSequence(pageCount, len);
      renderSequence();
      currentStep = 0;
      results = [];
      tbody.innerHTML = '';
      frameVisual.innerHTML = '';
      statsEl.innerHTML = '';
    }

    function renderSequence() {
      seqDisplay.innerHTML = '';
      sequence.forEach((p, i) => {
        const chip = createElement('div', 'queue-item', String(p));
        chip.style.cursor = 'pointer';
        chip.id = `seq-${i}`;
        seqDisplay.appendChild(chip);
      });
    }

    function run() {
      const algo = algoSelect.value as Algorithm;
      const frames = parseInt(frameInput.value) || 3;
      results = runReplacement(algo, sequence, frames);
      currentStep = 0;
      tbody.innerHTML = '';
      frameVisual.innerHTML = '';
      renderAll();
    }

    function renderAll() {
      const frames = parseInt(frameInput.value) || 3;
      // Build frame boxes
      frameVisual.innerHTML = '';
      for (let i = 0; i < frames; i++) {
        const box = createElement('div');
        box.style.width = '60px';
        box.style.height = '80px';
        box.style.border = '2px solid var(--border)';
        box.style.borderRadius = 'var(--radius-md)';
        box.style.display = 'flex';
        box.style.flexDirection = 'column';
        box.style.alignItems = 'center';
        box.style.justifyContent = 'center';
        box.style.background = 'var(--bg-page)';
        box.id = `frame-box-${i}`;
        const label = createElement('div', '', `页框${i}`);
        label.style.fontSize = '10px';
        label.style.color = 'var(--text-tertiary)';
        label.style.marginBottom = '4px';
        const val = createElement('div', '', '-');
        val.style.fontSize = '18px';
        val.style.fontWeight = '700';
        val.id = `frame-val-${i}`;
        box.append(label, val);
        frameVisual.appendChild(box);
      }

      tbody.innerHTML = '';
      let hits = 0;
      let misses = 0;
      results.forEach((r, i) => {
        if (i >= currentStep) return;
        const tr = createElement('tr');
        if (!r.hit) tr.style.background = 'var(--error-bg)';
        else { tr.style.background = 'var(--success-bg)'; hits++; }
        if (!r.hit) misses++;
        tr.innerHTML = `
          <td>${i + 1}</td>
          <td>${formatHex(r.logicalAddress)}</td>
          <td>${r.page}</td>
          <td>${r.hit ? '<span style="color:var(--success)">命中</span>' : '<span style="color:var(--error)">缺页</span>'}</td>
          <td>${r.victim !== undefined ? r.victim : '-'}</td>
          <td>${r.physicalAddress !== undefined ? formatHex(r.physicalAddress, 6) : '-'}</td>
        `;
        tbody.appendChild(tr);

        // Update frame visual
        r.frames.forEach((p, fi) => {
          const valEl = document.getElementById(`frame-val-${fi}`);
          if (valEl) valEl.textContent = p !== null ? String(p) : '-';
        });
      });
      statsEl.innerHTML = `命中: ${hits} | 缺页: ${misses} | 缺页率: ${misses > 0 ? ((misses / (hits + misses)) * 100).toFixed(1) : '0.0'}%`;
    }

    function doStep() {
      if (currentStep >= results.length) return;
      const r = results[currentStep];
      // Highlight sequence
      const seqChip = document.getElementById(`seq-${currentStep}`);
      if (seqChip) {
        seqChip.style.borderColor = r.hit ? 'var(--success)' : 'var(--error)';
        seqChip.style.background = r.hit ? 'var(--success-bg)' : 'var(--error-bg)';
      }
      currentStep++;
      renderAll();
    }

    function autoPlay() {
      if (animating) return;
      animating = true;
      function tick() {
        if (!animating || currentStep >= results.length) { animating = false; return; }
        doStep();
        timer = setTimeout(tick, 600);
      }
      tick();
    }

    function stop() {
      animating = false;
      if (timer) clearTimeout(timer);
    }

    btnGen.addEventListener('click', generate);
    btnRun.addEventListener('click', run);
    btnStep.addEventListener('click', doStep);
    btnAuto.addEventListener('click', autoPlay);
    btnStop.addEventListener('click', stop);

    generate();

    (container as any).__cleanup = () => { stop(); };
  },
  destroy() {
    const ca = document.getElementById('content-area');
    if (ca && (ca as any).__cleanup) { (ca as any).__cleanup(); (ca as any).__cleanup = null; }
  }
} as ExperimentModule;
