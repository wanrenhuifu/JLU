import type { ExperimentModule } from '../../app.ts';
import { createElement, sleep } from '../../common/utils.ts';
import { createCard, createButton, createInput, createSelect } from '../../common/ui-kit.ts';
import { ResourceGraph } from './algorithm.ts';

export default {
  name: '死锁检测：资源分配图约简',
  description: '环路判定与约简动画',
  init(container: HTMLElement) {
    container.innerHTML = '';
    const graph = new ResourceGraph();
    let animating = false;

    const grid = createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'minmax(280px, 1fr) 2fr';
    grid.style.gap = '16px';

    // Left panel
    const left = createElement('div');

    const { card: procCard, body: procBody } = createCard('进程');
    const procList = createElement('div');
    procList.style.display = 'flex';
    procList.style.flexWrap = 'wrap';
    procList.style.gap = '6px';
    procList.style.marginBottom = '10px';
    procBody.appendChild(procList);
    const procInput = createInput({ placeholder: '进程名如 P1' });
    procInput.style.width = '120px';
    const btnAddProc = createButton('添加进程', 'secondary');
    btnAddProc.classList.add('btn-sm');
    procBody.append(procInput, btnAddProc);
    left.appendChild(procCard);

    const { card: resCard, body: resBody } = createCard('资源类');
    const resList = createElement('div');
    resList.style.display = 'flex';
    resList.style.flexWrap = 'wrap';
    resList.style.gap = '6px';
    resList.style.marginBottom = '10px';
    resBody.appendChild(resList);
    const resInput = createInput({ placeholder: '资源名如 R1' });
    resInput.style.width = '80px';
    const resInst = createInput({ type: 'number', value: '1', min: '1' });
    resInst.style.width = '60px';
    const btnAddRes = createButton('添加资源', 'secondary');
    btnAddRes.classList.add('btn-sm');
    resBody.append(resInput, createElement('span', '', '数量:'), resInst, btnAddRes);
    left.appendChild(resCard);

    const { card: edgeCard, body: edgeBody } = createCard('边 (申请/占有)');
    const fromSel = createSelect([]);
    const toSel = createSelect([]);
    const typeSel = createSelect([{ value: 'request', label: '申请边 (P→R)' }, { value: 'allocation', label: '占有边 (R→P)' }]);
    const btnAddEdge = createButton('添加边', 'secondary');
    btnAddEdge.classList.add('btn-sm');
    edgeBody.innerHTML = '<div class="form-row"><span class="form-label">从</span></div>';
    (edgeBody.firstElementChild as HTMLElement).append(fromSel, createElement('span', '', '到'), toSel, typeSel, btnAddEdge);
    left.appendChild(edgeCard);

    const { card: ctrlCard, body: ctrlBody } = createCard('操作');
    const btnReduce = createButton('▶ 开始约简', 'primary');
    const btnReset = createButton('重置', 'danger');
    const btnDemo = createButton('加载示例', 'secondary');
    ctrlBody.append(btnReduce, btnReset, btnDemo);
    const statusEl = createElement('div');
    statusEl.style.marginTop = '12px';
    statusEl.style.fontWeight = '600';
    ctrlBody.appendChild(statusEl);
    left.appendChild(ctrlCard);

    grid.appendChild(left);

    // Right: Canvas
    const right = createElement('div');
    const { card: canvasCard, body: canvasBody } = createCard('资源分配图');
    canvasBody.style.padding = '0';
    canvasBody.style.overflow = 'hidden';
    const canvas = createElement('canvas') as HTMLCanvasElement;
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = 800;
    const cssHeight = 500;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';
    canvas.style.maxWidth = '100%';
    canvas.style.display = 'block';
    canvasBody.appendChild(canvas);
    right.appendChild(canvasCard);
    grid.appendChild(right);
    container.appendChild(grid);

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    function updateSelects() {
      const all = Array.from(graph.nodes.values());
      fromSel.innerHTML = '';
      toSel.innerHTML = '';
      all.forEach(n => {
        const o1 = createElement('option');
        o1.value = n.id;
        o1.textContent = n.name;
        fromSel.appendChild(o1);
        const o2 = createElement('option');
        o2.value = n.id;
        o2.textContent = n.name;
        toSel.appendChild(o2);
      });
    }

    function layoutNodes() {
      const procs = Array.from(graph.nodes.values()).filter(n => n.type === 'process');
      const ress = Array.from(graph.nodes.values()).filter(n => n.type === 'resource');
      const margin = 60;
      const W = cssWidth - margin * 2;
      procs.forEach((n, i) => {
        n.x = margin + (W / Math.max(procs.length, 1)) * i + W / Math.max(procs.length, 1) / 2;
        n.y = 120;
      });
      ress.forEach((n, i) => {
        n.x = margin + (W / Math.max(ress.length, 1)) * i + W / Math.max(ress.length, 1) / 2;
        n.y = 350;
      });
    }

    function drawGraph(highlightNode?: string) {
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.fillStyle = '#FAF9F7';
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      // Draw edges
      graph.edges.forEach(e => {
        const from = graph.nodes.get(e.from);
        const to = graph.nodes.get(e.to);
        if (!from || !to) return;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;
        const startX = from.x + nx * (from.type === 'process' ? 25 : 30);
        const startY = from.y + ny * (from.type === 'process' ? 25 : 30);
        const endX = to.x - nx * (to.type === 'process' ? 25 : 30);
        const endY = to.y - ny * (to.type === 'process' ? 25 : 30);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = e.type === 'request' ? '#C05621' : '#2F855A';
        ctx.lineWidth = 2;
        ctx.setLineDash(e.type === 'request' ? [6, 4] : []);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrowhead
        const headlen = 10;
        const angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.fillStyle = e.type === 'request' ? '#C05621' : '#2F855A';
        ctx.fill();
      });

      // Draw nodes
      graph.nodes.forEach(n => {
        const isHL = n.id === highlightNode;
        if (n.type === 'process') {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 25, 0, Math.PI * 2);
          ctx.fillStyle = isHL ? '#FDF2EC' : '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = isHL ? '#D97757' : '#6B6B6B';
          ctx.lineWidth = isHL ? 3 : 2;
          ctx.stroke();
        } else {
          ctx.fillStyle = isHL ? '#FDF2EC' : '#FFFFFF';
          ctx.fillRect(n.x - 30, n.y - 25, 60, 50);
          ctx.strokeStyle = isHL ? '#D97757' : '#6B6B6B';
          ctx.lineWidth = isHL ? 3 : 2;
          ctx.strokeRect(n.x - 30, n.y - 25, 60, 50);
          // Draw dots for instances
          const cols = Math.ceil(Math.sqrt(n.instances));
          for (let i = 0; i < n.instances; i++) {
            const cx = n.x - 20 + (i % cols) * 10;
            const cy = n.y + 5 + Math.floor(i / cols) * 10;
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#D97757';
            ctx.fill();
          }
        }
        ctx.fillStyle = '#1A1A1A';
        ctx.font = '13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.name, n.x, n.y - (n.type === 'resource' ? 8 : 0));
      });
    }

    function refresh() {
      layoutNodes();
      updateSelects();
      drawGraph();
      renderLists();
    }

    function renderLists() {
      procList.innerHTML = '';
      resList.innerHTML = '';
      graph.nodes.forEach(n => {
        const chip = createElement('span');
        chip.style.padding = '4px 8px';
        chip.style.borderRadius = 'var(--radius-sm)';
        chip.style.fontSize = '12px';
        chip.style.background = n.type === 'process' ? '#F0FDF4' : '#FFF7ED';
        chip.style.color = n.type === 'process' ? '#2F855A' : '#C05621';
        chip.style.border = `1px solid ${n.type === 'process' ? '#2F855A' : '#C05621'}`;
        chip.textContent = n.name + (n.type === 'resource' ? `(${n.instances})` : '');
        if (n.type === 'process') procList.appendChild(chip);
        else resList.appendChild(chip);
      });
    }

    btnAddProc.addEventListener('click', () => {
      const name = procInput.value.trim() || `P${graph.nodes.size + 1}`;
      const id = `proc_${Date.now()}_${Math.random()}`;
      graph.addProcess(id, name);
      procInput.value = '';
      refresh();
    });

    btnAddRes.addEventListener('click', () => {
      const name = resInput.value.trim() || `R${graph.nodes.size + 1}`;
      const inst = parseInt(resInst.value) || 1;
      const id = `res_${Date.now()}_${Math.random()}`;
      graph.addResource(id, name, inst);
      resInput.value = '';
      refresh();
    });

    btnAddEdge.addEventListener('click', () => {
      graph.addEdge(fromSel.value, toSel.value, typeSel.value as 'request' | 'allocation');
      refresh();
    });

    btnReset.addEventListener('click', () => {
      graph.nodes.clear();
      graph.edges = [];
      statusEl.textContent = '';
      refresh();
    });

    btnDemo.addEventListener('click', () => {
      graph.nodes.clear();
      graph.edges = [];
      graph.addProcess('p1', 'P1');
      graph.addProcess('p2', 'P2');
      graph.addProcess('p3', 'P3');
      graph.addResource('r1', 'R1', 2);
      graph.addResource('r2', 'R2', 2);
      graph.addEdge('p1', 'r2', 'request');
      graph.addEdge('r2', 'p2', 'allocation');
      graph.addEdge('p2', 'r1', 'request');
      graph.addEdge('r1', 'p3', 'allocation');
      graph.addEdge('p3', 'r2', 'request');
      refresh();
    });

    async function animateReduce() {
      if (animating) return;
      animating = true;
      btnReduce.disabled = true;
      statusEl.textContent = '开始约简...';
      statusEl.style.color = 'var(--text-secondary)';
      let step = 1;
      while (graph.nodes.size > 0) {
        const { reduced, reducedNode, remaining } = graph.reduceStep();
        if (!reduced) break;
        drawGraph(reducedNode);
        statusEl.textContent = `步骤 ${step}: 消去进程 ${reducedNode}`;
        statusEl.style.color = 'var(--accent)';
        await sleep(1200);
        step++;
        if (!remaining) break;
      }
      if (graph.nodes.size === 0) {
        statusEl.textContent = '✅ 图可完全约简，系统无死锁';
        statusEl.style.color = 'var(--success)';
      } else {
        statusEl.textContent = `❌ 图不可完全约简，剩余 ${Array.from(graph.nodes.values()).filter(n => n.type === 'process').length} 个进程，存在死锁`;
        statusEl.style.color = 'var(--error)';
      }
      animating = false;
      btnReduce.disabled = false;
    }

    btnReduce.addEventListener('click', animateReduce);

    // Init demo
    btnDemo.click();

    (container as any).__cleanup = () => { animating = false; };
  },
  destroy() {
    const ca = document.getElementById('content-area');
    if (ca && (ca as any).__cleanup) { (ca as any).__cleanup(); (ca as any).__cleanup = null; }
  }
} as ExperimentModule;
