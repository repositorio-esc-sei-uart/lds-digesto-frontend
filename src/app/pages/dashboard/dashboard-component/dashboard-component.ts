import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../components/sidebar-component/sidebar-component';

@Component({
  selector: 'app-dashboard-component',
  imports: [
    RouterModule,
    SidebarComponent
  ],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css'
})
export class DashboardComponent {
  constructor() {}
}
