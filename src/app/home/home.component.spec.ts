import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { Component, NO_ERRORS_SCHEMA, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from "@angular/router/testing";

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterModule.forRoot(
        [{path: '', component: BlankCmp}]
      )],
      providers: [provideExperimentalZonelessChangeDetection()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    await fixture.whenStable();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


/// A blank component to make the testing router work
@Component({
  selector: 'blank',
  imports: [ ],
  template: '',
  styles: ''
})
export class BlankCmp {

}
