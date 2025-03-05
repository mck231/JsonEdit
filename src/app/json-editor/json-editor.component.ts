import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal, computed } from '@angular/core';
import { NgtCanvas, extend } from 'angular-three';
import { SceneGraph } from '../scene-graph/scene-graph.component';
import { MatIconModule } from '@angular/material/icon';
import { ParserService } from '../services/parser.service';
import * as THREE from 'three';
extend(THREE);

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
  constructor() {}

  protected sceneGraph = SceneGraph;
}
