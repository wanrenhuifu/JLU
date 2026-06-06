export interface Process {
  id: string;
  name: string;
  totalTime: number;
  remainingTime: number;
  state: 'ready' | 'running' | 'waiting' | 'finished';
  queueLevel: number;
  arrivalTime: number;
}

export interface QueueConfig {
  priority: number;
  timeSlice: number;
}

export class FBScheduler {
  queues: QueueConfig[];
  processes: Process[] = [];
  readyQueues: Process[][] = [];
  waitingQueue: Process[] = [];
  runningProcess: Process | null = null;
  currentTime = 0;
  timeInSlice = 0;
  onUpdate?: () => void;
  private timer: ReturnType<typeof setInterval> | null = null;
  private speed = 500;
  private running = false;

  constructor(queues: QueueConfig[]) {
    this.queues = queues;
    this.readyQueues = queues.map(() => []);
  }

  addProcess(name: string, totalTime: number) {
    const p: Process = {
      id: `P${this.processes.length + 1}`,
      name,
      totalTime,
      remainingTime: totalTime,
      state: 'ready',
      queueLevel: 0,
      arrivalTime: this.currentTime,
    };
    this.processes.push(p);
    this.readyQueues[0].push(p);
    this.onUpdate?.();
  }

  setSpeed(ms: number) {
    this.speed = ms;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.tick();
  }

  pause() {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  step() {
    this.pause();
    this.doTick();
  }

  reset() {
    this.pause();
    this.processes = [];
    this.readyQueues = this.queues.map(() => []);
    this.waitingQueue = [];
    this.runningProcess = null;
    this.currentTime = 0;
    this.timeInSlice = 0;
    this.onUpdate?.();
  }

  private tick() {
    if (!this.running) return;
    this.doTick();
    this.timer = setTimeout(() => this.tick(), this.speed);
  }

  private doTick() {
    // Handle random I/O completion
    if (this.waitingQueue.length > 0 && Math.random() < 0.15) {
      const idx = Math.floor(Math.random() * this.waitingQueue.length);
      const p = this.waitingQueue.splice(idx, 1)[0];
      p.state = 'ready';
      p.queueLevel = 0;
      this.readyQueues[0].push(p);
    }

    // Handle running process
    if (this.runningProcess) {
      const p = this.runningProcess;
      p.remainingTime--;
      this.timeInSlice++;
      this.currentTime++;

      // Random I/O request
      if (p.remainingTime > 0 && Math.random() < 0.08) {
        p.state = 'waiting';
        this.waitingQueue.push(p);
        this.runningProcess = null;
        this.timeInSlice = 0;
        this.scheduleNext();
        this.onUpdate?.();
        return;
      }

      // Check if finished
      if (p.remainingTime <= 0) {
        p.state = 'finished';
        this.runningProcess = null;
        this.timeInSlice = 0;
        this.scheduleNext();
        this.onUpdate?.();
        return;
      }

      // Check time slice expiration
      const slice = this.queues[p.queueLevel].timeSlice;
      if (this.timeInSlice >= slice) {
        p.state = 'ready';
        this.runningProcess = null;
        this.timeInSlice = 0;
        const nextLevel = Math.min(p.queueLevel + 1, this.queues.length - 1);
        p.queueLevel = nextLevel;
        this.readyQueues[nextLevel].push(p);
        this.scheduleNext();
        this.onUpdate?.();
        return;
      }

      this.onUpdate?.();
      return;
    }

    this.currentTime++;
    this.scheduleNext();
    this.onUpdate?.();
  }

  private scheduleNext() {
    for (let i = 0; i < this.queues.length; i++) {
      if (this.readyQueues[i].length > 0) {
        const p = this.readyQueues[i].shift()!;
        p.state = 'running';
        this.runningProcess = p;
        this.timeInSlice = 0;
        return;
      }
    }
  }
}
