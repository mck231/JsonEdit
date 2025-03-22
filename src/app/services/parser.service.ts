import { Injectable } from '@angular/core';

interface GraphNode {
  id: string;
  label: string;
}

interface GraphEdge {
  source: string;
  target: string;
  label?: string; // Optional edge label
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

@Injectable({
  providedIn: 'root'
})
export class ParserService {
  private nodes: GraphNode[] = [];
  private edges: GraphEdge[] = [];
  private nodeIdCounter = 0;

  constructor() { }

  parseJson(jsonString: string): void {
    try {
      const json = JSON.parse(jsonString);
      this.nodeIdCounter = 0; // Reset counter
      this.nodes = [];       // Clear previous data
      this.edges = [];       // Clear previous data
      const rootId = this.addNode('Object'); // Start with "Object" root
      this.processValue(json, rootId);
    } catch (error) {
      console.error("Invalid JSON:", error);
      // Handle invalid JSON (e.g., show an error message to the user)
    }
  }

  private addNode(label: string): string {
    const id = `node-${this.nodeIdCounter++}`;
    this.nodes.push({ id, label });
    return id;
  }

  private processValue(value: any, parentId: string, key?: string): void {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        const arrayNodeId = this.addNode(`Array (${value.length})`);
        if (key) {
          this.edges.push({ source: parentId, target: arrayNodeId, label: key });
        } else {
          this.edges.push({ source: parentId, target: arrayNodeId }); // No key for root
        }
        value.forEach((item, index) => {
          this.processValue(item, arrayNodeId, String(index));  // Index as key
        });

      } else { // Regular object
        const objectNodeId = this.addNode('Object');
        if(key){
          this.edges.push({ source: parentId, target: objectNodeId, label: key });
        } else {
          this.edges.push({source: parentId, target: objectNodeId});
        }

        for (const objectKey in value) {
          if (value.hasOwnProperty(objectKey)) { //For in can give inherited props
            this.processValue(value[objectKey], objectNodeId, objectKey);
          }
        }
      }
    } else {
      // Primitive value (string, number, boolean, null)
      const primitiveNodeId = this.addNode(String(value));
      if(key) {
        this.edges.push({ source: parentId, target: primitiveNodeId, label: key });
      } else {
        this.edges.push({source: parentId, target: primitiveNodeId});
      }
    }
  }


  graph(): GraphData {
    return { nodes: this.nodes, edges: this.edges };
  }

  reset(): void {  // Add a reset method
    this.nodes = [];
    this.edges = [];
    this.nodeIdCounter = 0;
  }
}
