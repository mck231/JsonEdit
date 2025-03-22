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
  graphEdges: { positions: [number, number, number][]; label?: string }[] = []; // Store edge labels

  constructor(private parser: ParserService) { }

  ngAfterViewInit(): void {
    // Example JSON (or get from textarea input, as we'll add later)
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
    const positions = this.computeLayout(graph);

    this.graphNodes = graph.nodes.map(node => ({
      id: node.id,
      label: node.label,
      position: positions[node.id] || [0, 0, 0]
    }));

    this.graphEdges = graph.edges.map(edge => ({
      positions: [positions[edge.source], positions[edge.target]],
      label: edge.label // Store the label
    }));

    this.initThree();
    this.buildGraph();
    this.animate();
  }

  initThree(): void {
    // ... (same as before) ...
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

    // Keyboard panning
    window.addEventListener('keydown', this.onKeyDown, false);

    // Listen for window resize.
    window.addEventListener('resize', this.onResize, false);
  }

  buildGraph(): void {
    // Create nodes (spheres and labels)
    this.graphNodes.forEach(node => {
      const geometry = new THREE.SphereGeometry(0.5, 16, 16);
      const material = new THREE.MeshStandardMaterial({ color: 'orange' });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(...node.position);
      this.scene.add(sphere);

      // --- Corrected Node Label Positioning ---
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 256;
      canvas.height = 64;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000';
      ctx.font = '24px sans-serif';
      ctx.fillText(node.label, 10, 40);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);

      // Set the sprite's position RELATIVE TO the sphere.
      sprite.position.set(node.position[0], node.position[1] - 1, node.position[2]);  // Offset slightly below
      sprite.scale.set(2, 1, 1);
      this.scene.add(sprite);
    });

    // Create edges and edge labels (no changes here)
    this.graphEdges.forEach(edge => {
      const [p1, p2] = edge.positions;
      if (!p1 || !p2) return;

      const points = [new THREE.Vector3(...p1), new THREE.Vector3(...p2)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 'black' });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);

      if (edge.label) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 256;
        canvas.height = 64;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '16px sans-serif';
        ctx.fillText(edge.label, 10, 30);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);

        const midPoint = new THREE.Vector3().lerpVectors(
          new THREE.Vector3(...p1),
          new THREE.Vector3(...p2),
          0.5
        );
        sprite.position.copy(midPoint);
        sprite.scale.set(1.5, 0.75, 1);
        this.scene.add(sprite);
      }
    });

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
    const nodeDepths = new Map<string, number>();
    const nodeWidths = new Map<string, number>();

    // Build adjacency from edges (same as before)
    graph.edges.forEach(edge => {
      if (!childrenMap.has(edge.source)) {
        childrenMap.set(edge.source, []);
      }
      childrenMap.get(edge.source)!.push(edge.target);
      allTargets.add(edge.target);
    });

    // Identify root (same as before)
    const rootNode = graph.nodes.find(n => !allTargets.has(n.id));
    if (!rootNode) {
      console.error("No root node found.");
      return pos;
    }

    // Calculate depths (same as before)
    const calculateDepth = (nodeId: string, depth: number) => {
      nodeDepths.set(nodeId, depth);
      const children = childrenMap.get(nodeId) || [];
      children.forEach(childId => calculateDepth(childId, depth + 1));
    };
    calculateDepth(rootNode.id, 0);


    // RECURSIVE width calculation (Key Change)
    const calculateWidthRequirements = (nodeId: string): number => {
      const children = childrenMap.get(nodeId) || [];
      if (children.length === 0) {
        // Base width for leaf nodes (adjust as needed)
        nodeWidths.set(nodeId, 3);
        return 3;
      }

      let totalWidth = 0;
      children.forEach(childId => {
        totalWidth += calculateWidthRequirements(childId);
      });

      // Add spacing between children
      totalWidth += (children.length - 1) * 2;  // Adjust spacing as needed

      nodeWidths.set(nodeId, totalWidth);
      return totalWidth;
    };

    calculateWidthRequirements(rootNode.id);

    // Layout constants
    const verticalSpacing = 4;
    const horizontalSpacing = 3; // Adjust as needed

    // Assign positions, accumulating horizontal space
    const assignPositions = (nodeId: string, centerX: number, depth: number) => {
      pos[nodeId] = [centerX, -depth * verticalSpacing, 0];
      const children = childrenMap.get(nodeId) || [];

      if (children.length === 0) return;

      let currentX = centerX - (nodeWidths.get(nodeId)! / 2); // Start from left edge

      const sortedChildren = [...children].sort(
        (a, b) => (nodeWidths.get(b) || 0) - (nodeWidths.get(a) || 0)
      );

      sortedChildren.forEach((childId) => {
        const childWidth = nodeWidths.get(childId) || 0;
        // Use currentX directly, then increment it by the child's width + spacing
        assignPositions(childId, currentX + childWidth / 2, depth + 1);
        currentX += childWidth + horizontalSpacing; // Update accumulated X
      });
    };

    assignPositions(rootNode.id, 0, 0);
    return pos;
  }

  animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  // Keyboard arrow keys for panning (same as before)
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
    // ... (same as before) ...
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  ngOnDestroy(): void {
    // ... (same as before) ...
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onResize, false);
    window.removeEventListener('keydown', this.onKeyDown, false);
    this.controls.dispose();
    this.renderer.dispose();
  }
}
