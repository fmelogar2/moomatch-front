import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { AppShellComponent } from './shared/ui/app-shell/app-shell';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'herds',
        loadComponent: () => import('./features/herd/herd-list/herd-list').then((m) => m.HerdListComponent),
      },
      {
        path: 'cows/intake',
        loadComponent: () => import('./features/cow-intake/cow-intake').then((m) => m.CowIntakeComponent),
      },
      {
        path: 'recommendations/history',
        loadComponent: () =>
          import('./features/recommendation/recommendation-history/recommendation-history').then((m) => m.RecommendationHistoryComponent),
      },
      {
        path: 'recommendations/:cowId',
        loadComponent: () =>
          import('./features/recommendation/recommendation-analysis/recommendation-analysis').then((m) => m.RecommendationAnalysisComponent),
      },
      {
        path: 'mating-outcomes',
        loadComponent: () => import('./features/mating-outcomes/mating-outcomes').then((m) => m.MatingOutcomesComponent),
      },
      {
        path: 'herd-optimization',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/herd-optimization/herd-optimization-landing/herd-optimization-landing').then(
            (m) => m.HerdOptimizationLandingComponent,
          ),
      },
      {
        path: 'herd-optimization/setup',
        loadComponent: () =>
          import('./features/herd-optimization/setup/herd-optimization-setup').then((m) => m.HerdOptimizationSetupComponent),
      },
      {
        path: 'herd-optimization/results/:jobId',
        loadComponent: () =>
          import('./features/herd-optimization/results/herd-optimization-results').then((m) => m.HerdOptimizationResultsComponent),
      },
      {
        path: 'program-config',
        loadComponent: () => import('./features/program-config/program-config').then((m) => m.ProgramConfigComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/user-management/user-management').then((m) => m.UserManagementComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
