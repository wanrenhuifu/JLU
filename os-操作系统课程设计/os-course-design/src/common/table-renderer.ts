import { createElement } from './utils.ts';

export class TableRenderer {
  table: HTMLTableElement;
  tbody: HTMLTableSectionElement;

  constructor(parent: HTMLElement, headers: string[]) {
    const wrap = createElement('div', 'table-wrap');
    this.table = createElement('table', 'table') as HTMLTableElement;
    const thead = createElement('thead');
    const tr = createElement('tr');
    headers.forEach(h => {
      const th = createElement('th', '', h);
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    this.tbody = createElement('tbody');
    this.table.append(thead, this.tbody);
    wrap.appendChild(this.table);
    parent.appendChild(wrap);
  }

  setData(rows: (string | number)[][], highlightRow?: number, highlightCol?: number) {
    this.tbody.innerHTML = '';
    rows.forEach((row, ri) => {
      const tr = createElement('tr');
      if (ri === highlightRow) tr.style.background = 'var(--accent-light)';
      row.forEach((cell, ci) => {
        const td = createElement('td', '', String(cell));
        if (ri === highlightRow && ci === highlightCol) {
          td.style.fontWeight = '700';
          td.style.color = 'var(--accent)';
        }
        tr.appendChild(td);
      });
      this.tbody.appendChild(tr);
    });
  }

  destroy() {
    this.table.closest('.table-wrap')?.remove();
  }
}
