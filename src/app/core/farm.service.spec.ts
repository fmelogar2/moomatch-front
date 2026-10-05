import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService, MoomatchUserProfile } from './auth.service';
import { Farm, FarmService } from './farm.service';

describe('FarmService', () => {
  let httpMock: HttpTestingController;
  let profileSignal: ReturnType<typeof signal<MoomatchUserProfile | null>>;

  beforeEach(() => {
    profileSignal = signal<MoomatchUserProfile | null>(null);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { profile: profileSignal } },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches the current farm as soon as a profile appears', () => {
    const service = TestBed.inject(FarmService);
    expect(service.farm()).toBeNull();

    profileSignal.set({
      id: 'u1',
      email: 'admin@test.farm',
      role: 'FARM_ADMIN',
      status: 'ACTIVE',
      herdAccess: [],
      lastLoginAt: null,
    });
    TestBed.flushEffects();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/backoffice/farms/me`);
    const farm: Farm = { id: 'f1', name: 'Green Valley Dairy', mfaRequired: false };
    req.flush(farm);

    expect(service.farm()).toEqual(farm);
  });

  it('clears the farm signal when the profile disappears (logout)', () => {
    const service = TestBed.inject(FarmService);

    profileSignal.set({
      id: 'u1',
      email: 'admin@test.farm',
      role: 'FARM_ADMIN',
      status: 'ACTIVE',
      herdAccess: [],
      lastLoginAt: null,
    });
    TestBed.flushEffects();
    httpMock.expectOne(`${environment.apiBaseUrl}/backoffice/farms/me`)
      .flush({ id: 'f1', name: 'Green Valley Dairy', mfaRequired: false });
    expect(service.farm()).not.toBeNull();

    profileSignal.set(null);
    TestBed.flushEffects();

    expect(service.farm()).toBeNull();
  });

  it('leaves the farm signal empty when the lookup fails', () => {
    const service = TestBed.inject(FarmService);

    profileSignal.set({
      id: 'u1',
      email: 'admin@test.farm',
      role: 'FARM_ADMIN',
      status: 'ACTIVE',
      herdAccess: [],
      lastLoginAt: null,
    });
    TestBed.flushEffects();

    httpMock.expectOne(`${environment.apiBaseUrl}/backoffice/farms/me`)
      .flush('error', { status: 500, statusText: 'Server Error' });

    expect(service.farm()).toBeNull();
  });
});
