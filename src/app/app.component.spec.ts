import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { RouterModule } from '@angular/router';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterModule.forRoot(
              [{path: '', component: BlankCmp}]
            )],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();
  });

  it('should create the app', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // it(`should have the 'json-edit' title`, async () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   await fixture.whenStable();
  //   const app = fixture.componentInstance;

  //   expect(app.title).toEqual('json-edit');
  // });

//   it('should render title', async () => {
//     const fixture = TestBed.createComponent(AppComponent);
//     await fixture.whenStable();
//     const compiled = fixture.nativeElement as HTMLElement;
//     expect(compiled.querySelector('h1')?.textContent).toContain('Hello, json-edit');
//   });
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
