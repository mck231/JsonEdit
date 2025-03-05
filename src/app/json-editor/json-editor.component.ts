import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal, computed } from '@angular/core';
import { NgtCanvas, extend } from 'angular-three';
import { SceneGraph } from '../scene-graph/scene-graph.component';
import { MatIconModule } from '@angular/material/icon';
import { ParserService } from '../services/parser.service';
import * as THREE from 'three';
extend(THREE);
// interface PositionedNode {
//   id: string;
//   label: string;
//   position: NgtVector3; // [x, y, z]
// }

@Component({
  selector: 'app-json-editor',
  standalone: true,
  imports: [NgtCanvas, MatIconModule],
  templateUrl: './json-editor.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: [`
    :host {
      display: block;
     height: 100dvh;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonEditorComponent {
  // isExpanded = false;
  // isDesktop = false;
  // parserService = inject(ParserService);
  // rotation = signal([0, 0, 0]); // Store rotation as a signal

  // // Signals for reactive state management
  // positionedNodes = signal<PositionedNode[]>([]);
  // edges = computed(() => this.parserService.graph().edges);

  // // Provide some starter JSON for the demo
  // private readonly starterJson = {
  //   key: 'value',
  //   foo: [1, 2, 3],
  //   nested: { hello: 'world' },
  // };

  constructor() {
    // this.animate();

    // this.checkScreenSize();

    // // Parse the starter JSON when the component initializes
    // this.parserService.parseJson(this.starterJson);

    // // Layout the graph after parsing the JSON
    // this.layoutGraph();
  }

  protected sceneGraph = SceneGraph;

  // animate() {
  //   let angle = 0;
  //   setInterval(() => {
  //     angle += 0.05;
  //     this.rotation.set([angle, angle, 0]); // Update rotation
  //   }, 100);
  // }

  // checkScreenSize() {
  //   this.isDesktop = window.innerWidth >= 768;
  //   if (this.isDesktop) {
  //     this.isExpanded = true;
  //   }
  // }

  // layoutGraph(): void {
  //   const { nodes } = this.parserService.graph();
  
  //   // **Clear the previous positions before re-rendering**
  //   this.positionedNodes.set([]);
  
  //   // Positioning logic
  //   const numNodes = nodes.length;
  //   const radius = 5;
    
  //   this.positionedNodes.set(nodes.map((node, i) => {
  //     const angle = (2 * Math.PI * i) / Math.max(numNodes, 1);
  //     const x = radius * Math.cos(angle);
  //     const z = radius * Math.sin(angle);
  //     return { 
  //       id: node.id, 
  //       label: node.label, 
  //       position: [x, 0, z] as NgtVector3 
  //     };
  //   }));
  // }

  // getEdgePoints(edge: { source: string; target: string }): NgtVector3[] {
  //   const sourceNode = this.positionedNodes().find(n => n.id === edge.source);
  //   const targetNode = this.positionedNodes().find(n => n.id === edge.target);
  //   if (!sourceNode || !targetNode) {
  //     return [[0, 0, 0], [0, 0, 0]];
  //   }
  //   return [sourceNode.position, targetNode.position];
  // }

  // getNodeColor(node: PositionedNode): string {
  //   if (!isNaN(parseFloat(node.label))) return 'orange'; 
  //   return 'blue';
  // }  

  // toggleSidebar() {
  //   this.isExpanded = !this.isExpanded;
  // }

  // copyJson() { throw new Error('Method not implemented.'); }
  // pasteJson() { throw new Error('Method not implemented.'); }
  // transformJson() { throw new Error('Method not implemented.'); }
}