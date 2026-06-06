import type { ExperimentModule } from '../../app.ts';
import { createElement, randomInt } from '../../common/utils.ts';
import { createCard, createButton, createInput, createSelect } from '../../common/ui-kit.ts';

type DiskAlgo = 'FCFS' | 'SSTF' | 'SCAN' | 'LOOK';

interface DiskParams {
  trackCrossTime: number;
  startTime: number;
  rpm: number;
  sectorsPerTrack: number;
  bytesPerSector: number;
  tracks: number;
}

export default {
  name: '磁盘调度：引臂调度算法',
  description: 'FCFS/SSTF/SCAN/LOOK与时间计算',
  init(container: HTMLElement) {
    container.innerHTML = '';
    const params: DiskParams = {
      trackCrossTime: 1,
      startTime: 2,
      rpm: 5400,
      sectorsPerTrack: 63,
      bytesPerSector: 512,
      tracks: 200,
    };
    let sequence: number[] = [];
    let currentTrack = 50;
    let direction: 'up' | 'down' = 'up';

    const grid = createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'minmax(280px, 1fr) 2fr';
    grid.style.gap = '16px';

    // Left controls
    const left = createElement('div');
    const { card: paramCard, body: paramBody } = createCard('磁盘参数');
    const fields = [
      { key: 'trackCrossTime' as const, label: '跨越1磁道(ms)', value: '1' },
      { key: 'startTime' as const, label: '启动时间(ms)', value: '2' },
      { key: 'rpm' as const, label: '转速(rpm)', value: '5400' },
      { key: 'sectorsPerTrack' as const, label: '每磁道扇区数', value: '63' },
      { key: 'bytesPerSector' as const, label: '每扇区字节数', value: '512' },
    ];
    const inputs: Record<string, HTMLInputElement> = {};
    fields.forEach(f => {
      const row = createElement('div', 'form-row');
      row.innerHTML = `<span class="form-label">${f.label}</span>`;
      const inp = createInput({ type: 'number', value: f.value }) as HTMLInputElement;
      inp.style.width = '100px';
      inputs[f.key] = inp;
      row.appendChild(inp);
      paramBody.appendChild(row);
    });
    left.appendChild(paramCard);

    const { card: ctrlCard, body: ctrlBody } = createCard('调度控制');
    const algoRow = createElement('div', 'form-row');
    algoRow.innerHTML = `<span class="form-label">算法</span>`;
    const algoSelect = createSelect([
      { value: 'FCFS', label: 'FCFS (先来先服务)' },
      { value: 'SSTF', label: 'SSTF (最短查找时间)' },
      { value: 'SCAN', label: 'SCAN (扫描)' },
      { value: 'LOOK', label: 'LOOK (电梯)' },
    ], 'FCFS');
    algoRow.appendChild(algoSelect);
    ctrlBody.appendChild(algoRow);

    const curRow = createElement('div', 'form-row');
    curRow.innerHTML = `<span class="form-label">当前磁道</span>`;
    const curInput = createInput({ type: 'number', value: '50', min: '0', max: '199' }) as HTMLInputElement;
    curInput.style.width = '80px';
    const dirSelect = createSelect([{ value: 'up', label: '向内 ↑' }, { value: 'down', label: '向外 ↓' }], 'up');
    curRow.append(curInput, dirSelect);
    ctrlBody.appendChild(curRow);

    const seqRow = createElement('div', 'form-row');
    seqRow.innerHTML = `<span class="form-label">访问序列</span>`;
    const seqInput = createInput({ placeholder: '如 55,58,39,18,90,160,150,38,184' }) as HTMLInputElement;
    seqInput.style.flex = '1';
    seqRow.appendChild(seqInput);
    ctrlBody.appendChild(seqRow);

    const toolbar = createElement('div', 'toolbar');
    const btnRandom = createButton('随机生成', 'secondary');
    const btnCalc = createButton('计算调度', 'primary');
    toolbar.append(btnRandom, btnCalc);
    ctrlBody.appendChild(toolbar);
    left.appendChild(ctrlCard);

    const { card: resCard, body: resBody } = createCard('计算结果');
    const resArea = createElement('div');
    resArea.style.fontSize = '13px';
    resArea.style.lineHeight = '1.8';
    resBody.appendChild(resArea);
    left.appendChild(resCard);
    grid.appendChild(left);

    // Right canvas
    const right = createElement('div');
    const { card: canvasCard, body: canvasBody } = createCard('磁头移动可视化');
    canvasBody.style.padding = '0';
    const canvas = createElement('canvas') as HTMLCanvasElement;
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = 900;
    const cssHeight = 400;
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

    function updateParams() {
      params.trackCrossTime = parseFloat(inputs.trackCrossTime.value) || 1;
      params.startTime = parseFloat(inputs.startTime.value) || 2;
      params.rpm = parseFloat(inputs.rpm.value) || 5400;
      params.sectorsPerTrack = parseFloat(inputs.sectorsPerTrack.value) || 63;
      params.bytesPerSector = parseFloat(inputs.bytesPerSector.value) || 512;
      currentTrack = parseInt(curInput.value) || 50;
      direction = dirSelect.value as 'up' | 'down';
    }

    function randomSeq() {
      const len = randomInt(8, 16);
      sequence = Array.from({ length: len }, () => randomInt(0, 199));
      seqInput.value = sequence.join(',');
    }

    function schedule(algo: DiskAlgo): number[] {
      const seq = [...sequence];
      if (algo === 'FCFS') return [currentTrack, ...seq];
      if (algo === 'SSTF') {
        let pos = currentTrack;
        const result = [pos];
        const pending = [...seq];
        while (pending.length > 0) {
          pending.sort((a, b) => Math.abs(a - pos) - Math.abs(b - pos));
          pos = pending.shift()!;
          result.push(pos);
        }
        return result;
      }
      if (algo === 'SCAN') {
        const result = [currentTrack];
        const up = seq.filter(s => s >= currentTrack).sort((a, b) => a - b);
        const down = seq.filter(s => s < currentTrack).sort((a, b) => b - a);
        if (direction === 'up') {
          result.push(...up, 199, ...down);
        } else {
          result.push(...down, 0, ...up);
        }
        return result;
      }
      if (algo === 'LOOK') {
        const result = [currentTrack];
        const up = seq.filter(s => s >= currentTrack).sort((a, b) => a - b);
        const down = seq.filter(s => s < currentTrack).sort((a, b) => b - a);
        if (direction === 'up') {
          result.push(...up, ...down);
        } else {
          result.push(...down, ...up);
        }
        return result;
      }
      return [currentTrack];
    }

    function draw(scheduleSeq: number[]) {
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.fillStyle = '#FAF9F7';
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      const margin = { top: 40, bottom: 60, left: 50, right: 30 };
      const chartW = cssWidth - margin.left - margin.right;
      const chartH = cssHeight - margin.top - margin.bottom;

      // Grid lines
      ctx.strokeStyle = '#E5E2DE';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const y = margin.top + (chartH / 10) * i;
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + chartW, y);
        ctx.stroke();
        const trackVal = Math.round(199 * (1 - i / 10));
        ctx.fillStyle = '#6B6B6B';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(String(trackVal), margin.left - 8, y + 4);
      }

      // Axis labels
      ctx.fillStyle = '#1A1A1A';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('访问顺序', margin.left + chartW / 2, cssHeight - 15);

      // Draw path
      if (scheduleSeq.length > 1) {
        const stepX = chartW / (scheduleSeq.length - 1);
        ctx.beginPath();
        ctx.strokeStyle = '#D97757';
        ctx.lineWidth = 2.5;
        scheduleSeq.forEach((track, i) => {
          const x = margin.left + i * stepX;
          const y = margin.top + chartH * (1 - track / 199);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw points
        scheduleSeq.forEach((track, i) => {
          const x = margin.left + i * stepX;
          const y = margin.top + chartH * (1 - track / 199);
          ctx.beginPath();
          ctx.arc(x, y, i === 0 ? 6 : 4, 0, Math.PI * 2);
          ctx.fillStyle = i === 0 ? '#6B4F9B' : '#D97757';
          ctx.fill();
          if (i === 0) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          ctx.fillStyle = '#1A1A1A';
          ctx.font = '10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(track), x, y - 10);
        });
      }
    }

    function calculate() {
      updateParams();
      const algo = algoSelect.value as DiskAlgo;
      const seq = schedule(algo);
      draw(seq);

      let movement = 0;
      for (let i = 1; i < seq.length; i++) {
        movement += Math.abs(seq[i] - seq[i - 1]);
      }

      const seekTime = params.startTime + movement * params.trackCrossTime;
      const rotationTime = (60 / params.rpm) * 1000; // ms per rotation
      const avgRotationDelay = rotationTime / 2;
      const transferTime = (60 / params.rpm) / params.sectorsPerTrack * 1000;
      const totalTime = seekTime + avgRotationDelay + transferTime;

      resArea.innerHTML = `
        <div><strong>调度算法:</strong> ${algo}</div>
        <div><strong>引臂移动序列:</strong> ${seq.join(' → ')}</div>
        <div><strong>引臂移动量:</strong> ${movement} 磁道</div>
        <div><strong>寻道时间:</strong> ${seekTime.toFixed(2)} ms (启动${params.startTime} + 移动${movement}×${params.trackCrossTime})</div>
        <div><strong>平均旋转延迟:</strong> ${avgRotationDelay.toFixed(2)} ms</div>
        <div><strong>传输时间:</strong> ${transferTime.toFixed(4)} ms</div>
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);"><strong>总处理时间:</strong> ${totalTime.toFixed(2)} ms</div>
      `;
    }

    btnRandom.addEventListener('click', randomSeq);
    btnCalc.addEventListener('click', calculate);

    randomSeq();
    calculate();
  },
  destroy() {
    // no running timers in this experiment
  }
} as ExperimentModule;
