import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonEditorComponent } from './json-editor.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('JsonEditorComponent', () => {
  let component: JsonEditorComponent;
  let fixture: ComponentFixture<JsonEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonEditorComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
      
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonEditorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
