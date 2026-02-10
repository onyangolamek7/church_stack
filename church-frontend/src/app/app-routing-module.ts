import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '.pages/home/home.component';
import {HymnsComponent} from ".pages/hymns/hymns.component";
import {SermonsComponent} from ".pages/sermons/sermons.component";

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'hymns', component: HymnsComponent},
  {path: 'sermons', component: SermonsComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
