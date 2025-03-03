import { Routes } from '@angular/router';
import { JsonEditorComponent } from './json-editor/json-editor.component';
import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'editor', component: JsonEditorComponent },
  { path: '**', redirectTo: 'about' }
];
