import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneGraph } from './scene-graph.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('SceneGraphComponent', () => {
  let component: SceneGraph;
  let fixture: ComponentFixture<SceneGraph>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneGraph],
      providers: [provideExperimentalZonelessChangeDetection()],
    
    })
    .compileComponents();

    fixture = TestBed.createComponent(SceneGraph);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
