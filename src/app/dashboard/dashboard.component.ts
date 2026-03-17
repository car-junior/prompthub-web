import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly username = this.authService.getCurrentUsername();
  readonly isAdmin = this.authService.isAdmin();

  readonly navItems: NavItem[] = [
    { label: 'Prompts', icon: 'auto_awesome', route: 'prompts' },
    { label: 'Times', icon: 'groups', route: 'teams' },
    { label: 'Usuários', icon: 'people', route: 'users', adminOnly: true },
    { label: 'Tags', icon: 'label', route: 'tags', adminOnly: true },
  ];

  get visibleNavItems(): NavItem[] {
    return this.navItems.filter(item => !item.adminOnly || this.isAdmin);
  }

  logout(): void {
    this.authService.logout();
  }
}
