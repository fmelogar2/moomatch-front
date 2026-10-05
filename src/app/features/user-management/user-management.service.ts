import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRole } from '../../core/auth.service';

export type UserStatus = 'ACTIVE' | 'DEACTIVATED' | 'PENDING_INVITE' ;
export type InvitationStatus = 'PENDING';

/** UserSummaryResponse — matches backoffice-service UserController's toSummary() shape (BO-USER-4). */
export interface UserSummary {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  herdAccess: string[];
  lastLoginAt: string | null;
}
export interface InvitationSummary {
  id: string;
  farmId: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  herdScope: string[];
  invitedBy: string; 
  createdAt: string;
  expiresAt: string;
}

export interface InviteUserRequest {
  email: string;
  role: UserRole;
  herdScope: string[] | null;
}

export interface ChangeRoleRequest {
  role: UserRole;
  herdScope: string[] | null;
}

const MOCK_USERS: UserSummary[] = [
  { id: 'u1', email: 'john.doe@greenpastures.com', role: 'FARM_ADMIN', status: 'ACTIVE', herdAccess: [], lastLoginAt: '2023-10-24T09:41:00Z' },
  { id: 'u2', email: 's.adams@greenpastures.com', role: 'BREEDER_TECHNICIAN', status: 'ACTIVE', herdAccess: ['North Barn', 'East Pasture'], lastLoginAt: '2023-10-23T14:22:00Z' },
  { id: 'u3', email: 'mike.k@contractor.com', role: 'BREEDER_TECHNICIAN', status: 'DEACTIVATED', herdAccess: ['South Barn'], lastLoginAt: '2023-09-15T08:10:00Z' },
];

const MOCK_INVITATIONS: InvitationSummary[] = [
  { id: 'i1', farmId: 'f1', email: 'jane.smith@greenpastures.com', role: 'FARM_ADMIN', status: 'PENDING', herdScope: [], invitedBy: 'john.doe@greenpastures.com', createdAt: '2023-10-24T09:41:00Z', expiresAt: '2023-11-24T09:41:00Z' },
  { id: 'i2', farmId: 'f1', email: 'bob.jones@greenpastures.com', role: 'BREEDER_TECHNICIAN', status: 'PENDING', herdScope: ['North Barn'], invitedBy: 's.adams@greenpastures.com', createdAt: '2023-10-23T14:22:00Z', expiresAt: '2023-11-23T14:22:00Z' },
];

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/backoffice/users`;

  /** GET /api/backoffice/users — real call, mock fallback (BO-USER-4). */
  list(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(this.base).pipe(catchError(() => of(MOCK_USERS)));
  }
  /** GET /api/backoffice/invitations — real call, mock fallback (BO-USER-4). */
  listInvitations(): Observable<InvitationSummary[]> {
    return this.http.get<InvitationSummary[]>(`${this.base}/invitations`).pipe(catchError(() => of(MOCK_INVITATIONS)));
  }

  /** POST /api/backoffice/users/invitations — real call, mock fallback (BO-USER-1). */
  invite(request: InviteUserRequest): Observable<{ id: string }> {
    return this.http
      .post<{ id: string }>(`${this.base}/invitations`, request)
      .pipe(catchError(() => of({ id: `mock-invite-${Date.now()}` })));
  }

  /** PUT /api/backoffice/users/{userId}/role — real call, mock fallback (BO-USER-2). */
  changeRole(userId: string, request: ChangeRoleRequest): Observable<UserSummary> {
    return this.http.put<UserSummary>(`${this.base}/${userId}/role`, request).pipe(
      catchError(() =>
        of({
          id: userId,
          email: MOCK_USERS.find((u) => u.id === userId)?.email ?? '',
          role: request.role,
          status: 'ACTIVE' as UserStatus,
          herdAccess: request.herdScope ?? [],
          lastLoginAt: null,
        }),
      ),
    );
  }

  /** POST /api/backoffice/users/{userId}/deactivate — real call, mock fallback (BO-USER-3). */
  deactivate(userId: string): Observable<UserSummary> {
    return this.http.post<UserSummary>(`${this.base}/${userId}/deactivate`, {}).pipe(
      catchError(() => of({ ...(MOCK_USERS.find((u) => u.id === userId) ?? MOCK_USERS[0]), status: 'DEACTIVATED' as UserStatus })),
    );
  }

  /** POST /api/backoffice/users/{userId}/reactivate — real call, mock fallback (BO-USER-3). */
  reactivate(userId: string): Observable<UserSummary> {
    return this.http.post<UserSummary>(`${this.base}/${userId}/reactivate`, {}).pipe(
      catchError(() => of({ ...(MOCK_USERS.find((u) => u.id === userId) ?? MOCK_USERS[0]), status: 'ACTIVE' as UserStatus })),
    );
  }
}
