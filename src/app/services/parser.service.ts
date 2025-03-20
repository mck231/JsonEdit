import { Injectable, signal } from '@angular/core';

// Define interfaces for graph structure
interface GraphNode { id: string; label: string; }
interface GraphEdge { source: string; target: string; label?: string; }
interface GraphData { nodes: GraphNode[]; edges: GraphEdge[]; }

@Injectable({ providedIn: 'root' })
export class ParserService {
  private readonly graphSignal = signal<GraphData>({ nodes: [], edges: [] });
  private nodeIdCounter = 0;  // Ensure this persists across calls

  get graph(): () => GraphData {
    return this.graphSignal;
  }

  parseJson(json: any): void {
    if (typeof json === 'string') {
      try {
        json = JSON.parse(json);
      } catch (error) {
        console.error('Invalid JSON', error);
        return;
      }
    }
    this.nodeIdCounter = 0;
    const graph = this.buildGraph(json);
    this.graphSignal.set(graph);
  }

  private buildGraph(json: any): GraphData {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const idMap = new Map<string, string>(); // Ensure key uniqueness

    const traverse = (value: any, parentId: string | null, edgeLabel: string | null) => {
      if (value !== null && typeof value === 'object') {
        if (Array.isArray(value)) {
          const arrayNodeId = this.generateId();
          nodes.push({ id: arrayNodeId, label: `Array (${value.length})` });

          if (parentId) {
            edges.push({ source: parentId, target: arrayNodeId, label: edgeLabel ?? undefined });
          }

          value.forEach((elem, index) => {
            traverse(elem, arrayNodeId, index.toString());
          });
        } else {
          const objectNodeId = this.generateId();
          nodes.push({ id: objectNodeId, label: 'Object' });

          if (parentId) {
            edges.push({ source: parentId, target: objectNodeId, label: edgeLabel ?? undefined });
          }

          Object.entries(value).forEach(([key, val]) => {
            if (!idMap.has(key)) {
              idMap.set(key, this.generateId()); // Store a unique ID for this key
            }
            const keyNodeId = idMap.get(key)!;
            nodes.push({ id: keyNodeId, label: key });

            edges.push({ source: objectNodeId, target: keyNodeId });
            traverse(val, keyNodeId, null);
          });
        }
      } else {
        const valueNodeId = this.generateId();
        nodes.push({ id: valueNodeId, label: String(value) });
        if (parentId) {
          edges.push({ source: parentId, target: valueNodeId, label: edgeLabel ?? undefined });
        }
      }
    };

    traverse(json, null, null);
    return { nodes, edges };
  }

  private generateId(): string {
    return `node-${this.nodeIdCounter++}`;
  }
}
