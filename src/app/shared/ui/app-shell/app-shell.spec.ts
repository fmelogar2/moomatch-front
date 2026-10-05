import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { AuthService, MoomatchUserProfile } from '../../../core/auth.service';
import { Farm, FarmService } from '../../../core/farm.service';
import { LanguageService } from '../../../core/language.service';
import { AppShellComponent } from './app-shell';

describe('AppShellComponent', () => {
  let profileSignal: ReturnType<typeof signal<MoomatchUserProfile | null>>;
  let farmSignal: ReturnType<typeof signal<Farm | null>>;

  const adminProfile: MoomatchUserProfile = {
    id: 'u1',
    email: 'admin@test.farm',
    role: 'FARM_ADMIN',
    status: 'ACTIVE',
    herdAccess: [],
    lastLoginAt: null,
  };
  const technicianProfile: MoomatchUserProfile = { ...adminProfile, role: 'BREEDER_TECHNICIAN' };

  beforeEach(() => {
    profileSignal = signal<MoomatchUserProfile | null>(null);
    farmSignal = signal<Farm | null>(null);

    TestBed.configureTestingModule({
      imports: [AppShellComponent, TranslocoTestingModule.forRoot({ langs: { en: {} }, translocoConfig: { availableLangs: ['en', 'es'], defaultLang: 'en' } })],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: { profile: profileSignal, signOut: vi.fn() } },
        { provide: FarmService, useValue: { farm: farmSignal } },
        { provide: LanguageService, useValue: { current: 'en', setLanguage: vi.fn() } },
      ],
    });
  });

  it('hides admin-only nav items for a Breeder/Technician', () => {
    profileSignal.set(technicianProfile);
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const paths = fixture.componentInstance.visibleNavItems.map((item) => item.path);
    expect(paths).not.toContain('/program-config');
    expect(paths).not.toContain('/users');
    expect(paths).toContain('/dashboard');
  });

  it('shows admin-only nav items for a Farm Admin', () => {
    profileSignal.set(adminProfile);
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const paths = fixture.componentInstance.visibleNavItems.map((item) => item.path);
    expect(paths).toContain('/program-config');
    expect(paths).toContain('/users');
  });

  it('renders the farm name once FarmService resolves it', () => {
    profileSignal.set(adminProfile);
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Green Valley Dairy');

    farmSignal.set({ id: 'f1', name: 'Green Valley Dairy', mfaRequired: false });
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Green Valley Dairy');
  });

  it('renders no farm banner when there is no farm yet (logged out)', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[title]')).toBeNull();
  });
});
