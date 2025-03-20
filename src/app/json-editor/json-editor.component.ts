import { Component, ElementRef, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { ParserService } from '../services/parser.service';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface GraphNode { id: string; label: string; }
interface GraphEdge { source: string; target: string; label?: string; }
interface GraphData { nodes: GraphNode[]; edges: GraphEdge[]; }

@Component({
  selector: 'app-json-editor',
  templateUrl: './json-editor.component.html',
  styles: [`
    .canvas-container { width: 100%; height: 100vh; overflow: hidden; }
  `]
})
export class JsonEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;
  animationFrameId = 0;

  graphNodes: { id: string; position: [number, number, number]; label: string }[] = [];
  graphEdges: { positions: [number, number, number][] }[] = [];

  constructor(private parser: ParserService) {}

  ngAfterViewInit(): void {
    // Example JSON; in a real app, parse user input or data from elsewhere.
    const exampleJson = `{
      "name": "John Doe",
      "age": 30,
      "email": "john.doe@example.com",
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zip": "12345"
      },
      "phoneNumbers": [
        { "type": "home", "number": "555-555-5555" },
        { "type": "work", "number": "555-555-5556" }
      ],
      "active": true
    }`;

    this.parser.parseJson(exampleJson);
    const graph: GraphData = this.parser.graph();

    // Compute layout for each node.
    const positions = this.computeLayout(graph);
    this.graphNodes = graph.nodes.map(node => ({
      id: node.id,
      label: node.label,
      position: positions[node.id] || [0, 0, 0]
    }));
    this.graphEdges = graph.edges.map(edge => ({
      positions: [positions[edge.source], positions[edge.target]]
    }));

    this.initThree();
    this.buildGraph();
    this.animate();
  }

  initThree(): void {
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;

    // Create scene with a light-gray background.
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);

    // Create camera.
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 10);

    // Create renderer.
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    // OrbitControls for mouse interaction.
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Keyboard zoom
    window.addEventListener('keydown', this.onKeyDown, false);

    // Listen for window resize.
    window.addEventListener('resize', this.onResize, false);
  }

  buildGraph(): void {
    // For each node, create a sphere and a text label.
    this.graphNodes.forEach(node => {
      // Create sphere
      const geometry = new THREE.SphereGeometry(0.5, 16, 16);
      const material = new THREE.MeshStandardMaterial({ color: 'orange' });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(...node.position);
      this.scene.add(sphere);

      // Create text label via sprite
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 256;
      canvas.height = 64;

      // Background for label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw node label
      ctx.fillStyle = '#000';
      ctx.font = '24px sans-serif';
      ctx.fillText(node.label, 10, 40);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);

      // Position the label slightly above or below the sphere.
      sprite.position.set(node.position[0], node.position[1] - 1, node.position[2]);
      sprite.scale.set(2, 1, 1); // Scale horizontally to fit text better
      this.scene.add(sprite);
    });

    // For each edge, create a line and add it to the scene.
    this.graphEdges.forEach(edge => {
      const [p1, p2] = edge.positions;
      if (!p1 || !p2) return;
      const points = [new THREE.Vector3(...p1), new THREE.Vector3(...p2)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 'black' });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
    });

    // Basic lighting.
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 0, 15);
    this.scene.add(pointLight);
  }

  computeLayout(graph: GraphData): { [key: string]: [number, number, number] } {
    const pos: { [key: string]: [number, number, number] } = {};
    const childrenMap = new Map<string, string[]>();
    const allTargets = new Set<string>();

    // Build adjacency from edges
    graph.edges.forEach(edge => {
      if (!childrenMap.has(edge.source)) {
        childrenMap.set(edge.source, []);
      }
      childrenMap.get(edge.source)!.push(edge.target);
      allTargets.add(edge.target);
    });

    // Identify the root node (the one not targeted by any edge).
    const rootNode = graph.nodes.find(n => !allTargets.has(n.id));
    if (!rootNode) {
      console.error("No root node found.");
      return pos;
    }

    // Increased spacing
    const baseVerticalSpacing = 4;
    const baseHorizontalSpacing = 6;

    const layoutNode = (nodeId: string, depth: number, x: number) => {
      pos[nodeId] = [x, -depth * baseVerticalSpacing, 0];
      const children = childrenMap.get(nodeId) || [];
      const count = children.length;

      children.forEach((childId, index) => {
        let childX = x;
        // Spread children horizontally
        if (count > 1) {
          childX = x - baseHorizontalSpacing / 2 + (baseHorizontalSpacing * index) / (count - 1);
        }
        layoutNode(childId, depth + 1, childX);
      });
    };

    layoutNode(rootNode.id, 0, 0);
    return pos;
  }

  animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  // Keyboard arrow keys for panning
  onKeyDown = (event: KeyboardEvent) => {
    event.preventDefault();
    const panDistance = 0.5;
    switch (event.key) {
      case 'ArrowUp':
        this.camera.position.y += panDistance;
        this.controls.target.y += panDistance;
        break;
      case 'ArrowDown':
        this.camera.position.y -= panDistance;
        this.controls.target.y -= panDistance;
        break;
      case 'ArrowLeft':
        this.camera.position.x -= panDistance;
        this.controls.target.x -= panDistance;
        break;
      case 'ArrowRight':
        this.camera.position.x += panDistance;
        this.controls.target.x += panDistance;
        break;
    }
  };

  onResize = (): void => {
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onResize, false);
    window.removeEventListener('keydown', this.onKeyDown, false);
    this.controls.dispose();
    this.renderer.dispose();
  }
}
