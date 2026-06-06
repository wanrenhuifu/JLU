export interface RGNode {
  id: string;
  name: string;
  type: 'process' | 'resource';
  instances: number;
  x: number;
  y: number;
}

export interface RGEdge {
  from: string;
  to: string;
  type: 'request' | 'allocation';
}

export class ResourceGraph {
  nodes: Map<string, RGNode> = new Map();
  edges: RGEdge[] = [];

  addProcess(id: string, name: string) {
    this.nodes.set(id, { id, name, type: 'process', instances: 0, x: 0, y: 0 });
  }

  addResource(id: string, name: string, instances: number) {
    this.nodes.set(id, { id, name, type: 'resource', instances, x: 0, y: 0 });
  }

  addEdge(from: string, to: string, type: 'request' | 'allocation') {
    this.edges.push({ from, to, type });
  }

  removeEdge(from: string, to: string, type: 'request' | 'allocation') {
    this.edges = this.edges.filter(e => !(e.from === from && e.to === to && e.type === type));
  }

  getAllocationsToResource(rid: string): RGEdge[] {
    return this.edges.filter(e => e.to === rid && e.type === 'allocation');
  }

  getRequestsFromProcess(pid: string): RGEdge[] {
    return this.edges.filter(e => e.from === pid && e.type === 'request');
  }

  getAllocationsFromResource(rid: string): RGEdge[] {
    return this.edges.filter(e => e.from === rid && e.type === 'allocation');
  }

  reduceStep(): { reduced: boolean; reducedNode?: string; remaining: boolean } {
    // Find a process that can be completely satisfied
    for (const [id, node] of this.nodes) {
      if (node.type !== 'process') continue;
      const requests = this.getRequestsFromProcess(id);
      let canSatisfy = true;
      for (const req of requests) {
        const res = this.nodes.get(req.to);
        if (!res) continue;
        const free = res.instances - this.getAllocationsToResource(req.to).length;
        if (free < 1) { canSatisfy = false; break; }
      }
      if (canSatisfy) {
        // Remove this process and all its edges
        this.nodes.delete(id);
        this.edges = this.edges.filter(e => e.from !== id && e.to !== id);
        return { reduced: true, reducedNode: id, remaining: this.nodes.size > 0 };
      }
    }
    return { reduced: false, remaining: this.nodes.size > 0 };
  }

  clone(): ResourceGraph {
    const g = new ResourceGraph();
    this.nodes.forEach(n => g.nodes.set(n.id, { ...n }));
    g.edges = this.edges.map(e => ({ ...e }));
    return g;
  }
}
