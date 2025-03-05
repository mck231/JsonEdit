import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, viewChild } from '@angular/core';
import { injectBeforeRender } from 'angular-three';
import { Mesh } from 'three';

@Component({
  selector: 'app-scene-graph',
  imports: [],
  template: `
  <ngt-mesh #mesh>
    <ngt-box-geometry />
  </ngt-mesh>
`,
  styleUrl: './scene-graph.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneGraph {
  meshRef = viewChild.required<ElementRef<Mesh>>('mesh');
constructor(){
  injectBeforeRender(() => {
    const mesh = this.meshRef().nativeElement;
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
  });
}
}
