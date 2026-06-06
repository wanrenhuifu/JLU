import { createElement } from './utils.ts';

export function createCard(title: string): { card: HTMLElement; body: HTMLElement } {
  const card = createElement('div', 'card');
  const titleEl = createElement('div', 'card-title', title);
  const body = createElement('div');
  card.append(titleEl, body);
  return { card, body };
}

export function createButton(text: string, variant: 'primary' | 'secondary' | 'danger' = 'primary'): HTMLButtonElement {
  const btn = createElement('button', `btn btn-${variant}`, text) as HTMLButtonElement;
  return btn;
}

export function createInput(opts?: { type?: string; placeholder?: string; value?: string; min?: string; max?: string }): HTMLInputElement {
  const input = createElement('input', 'input') as HTMLInputElement;
  if (opts?.type) input.type = opts.type;
  if (opts?.placeholder) input.placeholder = opts.placeholder;
  if (opts?.value) input.value = opts.value;
  if (opts?.min) input.min = opts.min;
  if (opts?.max) input.max = opts.max;
  return input;
}

export function createSelect(options: { value: string; label: string }[], value?: string): HTMLSelectElement {
  const select = createElement('select', 'select') as HTMLSelectElement;
  options.forEach(opt => {
    const option = createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    select.appendChild(option);
  });
  if (value) select.value = value;
  return select;
}

export function createBadge(text: string, type: 'success' | 'warning' | 'error' | 'info' = 'info'): HTMLElement {
  return createElement('span', `badge badge-${type}`, text);
}

export function createToolbar(): HTMLElement {
  return createElement('div', 'toolbar');
}

export function createLogArea(): HTMLElement {
  return createElement('div', 'log-area');
}

export function addLog(logArea: HTMLElement, message: string, type?: 'success' | 'warning' | 'error' | 'info') {
  const entry = createElement('div', 'log-entry', message);
  if (type) {
    const colorMap = {
      success: 'var(--success)',
      warning: 'var(--warning)',
      error: 'var(--error)',
      info: 'var(--info)',
    };
    entry.style.color = colorMap[type];
  }
  logArea.appendChild(entry);
  logArea.scrollTop = logArea.scrollHeight;
}
