import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, AvatarModule, TooltipModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  collapsed = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',      icon: 'pi pi-objects-column', route: '/dashboard' },
    { label: 'Users',          icon: 'pi pi-users',          route: '/users' },
    { label: 'Pets',           icon: 'pi pi-heart',          route: '/pets' },
    { label: 'Advertisements', icon: 'pi pi-megaphone',      route: '/advertisements' },
    { label: 'Reports',        icon: 'pi pi-flag',           route: '/reports' },
    { label: 'Categories',     icon: 'pi pi-tags',           route: '/categories' },
    { label: 'Cities',         icon: 'pi pi-map-marker',     route: '/cities' },
    { label: 'Heroes',         icon: 'pi pi-star',           route: '/heroes' },
  ];

  userInitials = computed(() => {
    const payload = this.authService.getUserPayload();
    if (!payload) return 'A';
    const sub = payload['sub'] as string;
    return sub ? sub.substring(0, 2).toUpperCase() : 'A';
  });

  constructor(private readonly authService: AuthService) {}

  toggleSidebar(): void {
    this.collapsed.update(v => !v);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
