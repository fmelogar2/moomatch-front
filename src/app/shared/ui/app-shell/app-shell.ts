import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth.service';
import { FarmService } from '../../../core/farm.service';
import { LanguageService } from '../../../core/language.service';

interface NavItem {
  path: string;
  labelKey: string;
  icon: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: 'dashboard' },
  { path: '/herds', labelKey: 'nav.herdManagement', icon: 'pets' },
  { path: '/cows/intake', labelKey: 'nav.cowIntake', icon: 'upload_file' },
  { path: '/recommendations/history', labelKey: 'nav.recommendationHistory', icon: 'history' },
  { path: '/mating-outcomes', labelKey: 'nav.matingOutcomes', icon: 'child_care' },
  { path: '/herd-optimization', labelKey: 'nav.wholeHerdOptimization', icon: 'hub' },
  { path: '/program-config', labelKey: 'nav.programConfiguration', icon: 'tune', adminOnly: true },
  { path: '/users', labelKey: 'nav.userManagement', icon: 'group', adminOnly: true },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoModule],
  templateUrl: './app-shell.html',
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  private readonly farmService = inject(FarmService);
  private readonly language = inject(LanguageService);

  readonly profile = this.auth.profile;
  readonly farm = this.farmService.farm;
  readonly navItems = NAV_ITEMS;

  get visibleNavItems(): NavItem[] {
    const isAdmin = this.profile()?.role === 'FARM_ADMIN';
    return this.navItems.filter((item) => !item.adminOnly || isAdmin);
  }

  get currentLang(): string {
    return this.language.current;
  }

  setLanguage(lang: string): void {
    this.language.setLanguage(lang);
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
  }
}
