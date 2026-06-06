import { createElement } from './utils.ts';

export interface QueueItem {
  id: string;
  label: string;
  status?: 'idle' | 'running' | 'waiting' | 'blocked';
  extra?: string;
}

export class QueueRenderer {
  container: HTMLElement;

  constructor(parent: HTMLElement, title?: string) {
    this.container = createElement('div', 'queue-container');
    if (title) {
      const h = createElement('div', 'card-title', title);
      parent.appendChild(h);
    }
    parent.appendChild(this.container);
  }

  setQueues(queues: { label: string; items: QueueItem[] }[]) {
    this.container.innerHTML = '';
    queues.forEach(q => {
      const row = createElement('div', 'queue-row');
      const label = createElement('div', 'queue-label', q.label);
      const itemsBox = createElement('div', 'queue-items');
      q.items.forEach(item => {
        const el = createElement('div', 'queue-item', item.label);
        if (item.status === 'running') el.classList.add('running');
        if (item.extra) {
          const extra = createElement('span');
          extra.style.color = 'var(--text-tertiary)';
          extra.style.marginLeft = '4px';
          extra.textContent = item.extra;
          el.appendChild(extra);
        }
        itemsBox.appendChild(el);
      });
      if (q.items.length === 0) {
        const empty = createElement('span');
        empty.style.color = 'var(--text-tertiary)';
        empty.style.fontSize = '11px';
        empty.textContent = '(空)';
        itemsBox.appendChild(empty);
      }
      row.append(label, itemsBox);
      this.container.appendChild(row);
    });
  }

  destroy() {
    this.container.remove();
  }
}
