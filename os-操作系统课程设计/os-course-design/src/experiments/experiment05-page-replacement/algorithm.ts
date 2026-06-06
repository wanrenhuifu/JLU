export type Algorithm = 'FIFO' | 'LRU' | 'NUR' | 'CLOCK';

export interface PageFrame {
  page: number;
  accessed: boolean;
  modified: boolean;
  loadedAt: number;
  lastAccessed: number;
}

export interface StepResult {
  page: number;
  hit: boolean;
  victim?: number;
  frames: (number | null)[];
  logicalAddress: number;
  physicalAddress?: number;
}

export function generateAccessSequence(pageCount: number, length: number): number[] {
  const seq: number[] = [];
  for (let i = 0; i < length; i++) {
    seq.push(Math.floor(Math.random() * pageCount));
  }
  return seq;
}

export function generateLogicalAddress(page: number, pageSize: number): number {
  const offset = Math.floor(Math.random() * pageSize);
  return (page << 12) | offset; // Assume 16-bit, pageSize 4K => 12-bit offset
}

export function runReplacement(
  algorithm: Algorithm,
  sequence: number[],
  frameCount: number,
  pageSize: number = 4096
): StepResult[] {
  const frames: (PageFrame | null)[] = Array(frameCount).fill(null);
  let clockHand = 0;
  let time = 0;
  const results: StepResult[] = [];
  const physicalFrames = Array.from({ length: frameCount * 2 }, (_, i) => i);

  sequence.forEach((page, idx) => {
    const logicalAddr = generateLogicalAddress(page, pageSize);
    const foundIdx = frames.findIndex(f => f && f.page === page);

    if (foundIdx !== -1) {
      frames[foundIdx]!.accessed = true;
      frames[foundIdx]!.lastAccessed = time;
      results.push({
        page,
        hit: true,
        frames: frames.map(f => f?.page ?? null),
        logicalAddress: logicalAddr,
        physicalAddress: (physicalFrames[foundIdx] || 0) * pageSize + (logicalAddr & 0xFFF),
      });
    } else {
      let victimIdx = -1;

      if (algorithm === 'FIFO') {
        let oldest = Infinity;
        frames.forEach((f, i) => {
          if (!f) victimIdx = i;
          else if (f.loadedAt < oldest) { oldest = f.loadedAt; victimIdx = i; }
        });
      } else if (algorithm === 'LRU') {
        let lru = Infinity;
        frames.forEach((f, i) => {
          if (!f) victimIdx = i;
          else if (f.lastAccessed < lru) { lru = f.lastAccessed; victimIdx = i; }
        });
      } else if (algorithm === 'NUR') {
        let bestClass = Infinity;
        frames.forEach((f, i) => {
          if (!f) victimIdx = i;
          else {
            const cls = (f.accessed ? 2 : 0) + (f.modified ? 1 : 0);
            if (cls < bestClass) { bestClass = cls; victimIdx = i; }
          }
        });
        // Reset accessed bits periodically
        if (idx % 5 === 0) frames.forEach(f => { if (f) f.accessed = false; });
      } else if (algorithm === 'CLOCK') {
        let scanned = 0;
        while (scanned < frameCount * 2) {
          const f = frames[clockHand];
          if (!f) { victimIdx = clockHand; break; }
          if (!f.accessed) { victimIdx = clockHand; break; }
          f.accessed = false;
          clockHand = (clockHand + 1) % frameCount;
          scanned++;
        }
        if (victimIdx === -1) victimIdx = clockHand;
        clockHand = (victimIdx + 1) % frameCount;
      }

      if (victimIdx === -1) victimIdx = 0;
      const victimPage = frames[victimIdx]?.page;
      frames[victimIdx] = {
        page,
        accessed: true,
        modified: Math.random() < 0.3,
        loadedAt: time,
        lastAccessed: time,
      };
      results.push({
        page,
        hit: false,
        victim: victimPage,
        frames: frames.map(f => f?.page ?? null),
        logicalAddress: logicalAddr,
        physicalAddress: (physicalFrames[victimIdx] || 0) * pageSize + (logicalAddr & 0xFFF),
      });
    }
    time++;
  });

  return results;
}
