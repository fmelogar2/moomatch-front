import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService, UserRole } from '../../core/auth.service';
import { ConfirmDialogService } from '../../shared/ui/confirm-dialog/confirm-dialog.service';
import { StatusPillComponent, StatusTone } from '../../shared/ui/status-pill/status-pill';
import { InvitationSummary, UserManagementService, UserStatus, UserSummary } from './user-management.service';

const STATUS_TONE: Record<UserStatus, StatusTone> = {
  ACTIVE: 'success',
  DEACTIVATED: 'neutral',
  PENDING_INVITE: 'warning',
};

const STATUS_LABEL_KEY: Record<UserStatus, string> = {
  ACTIVE: 'userManagement.status.active',
  DEACTIVATED: 'userManagement.status.deactivated',
  PENDING_INVITE: 'userManagement.status.pending',
};

/** user_management_moomatch prototype (BO-USER-1..5) — real HTTP against backoffice-service, gated to FARM_ADMIN. */
@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [TranslocoModule, FormsModule, DatePipe, StatusPillComponent],
  templateUrl: './user-management.html',
})
export class UserManagementComponent implements OnInit {
  private readonly service = inject(UserManagementService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly isAdmin = signal(false);
  readonly users = signal<UserSummary[]>([]);
  readonly invitations = signal<InvitationSummary[]>([]);
  readonly showInviteForm = signal(false);
  readonly editingUserId = signal<string | null>(null);

  inviteEmail = '';
  inviteRole: UserRole = 'BREEDER_TECHNICIAN';
  editRole: UserRole = 'BREEDER_TECHNICIAN';

  ngOnInit(): void {
    const admin = this.auth.profile()?.role === 'FARM_ADMIN';
    this.isAdmin.set(admin);
    if (!admin) {
      this.router.navigateByUrl('/dashboard');
      return;
    }
    this.reload();
  }

  private reload(): void {
    this.service.list().subscribe((users) => this.users.set(users));
    this.service.listInvitations().subscribe((invitations) => this.invitations.set(invitations));
  }

  get activeCount(): number {
    return this.users().filter((u) => u.status === 'ACTIVE').length;
  }

  get pendingCount(): number {
    return this.invitations().filter((i) => i.status === 'PENDING').length;
  }

  toneFor(status: UserStatus): StatusTone {
    return STATUS_TONE[status];
  }

  labelKeyFor(status: UserStatus): string {
    return STATUS_LABEL_KEY[status];
  }

  initials(email: string): string {
    return email.slice(0, 2).toUpperCase();
  }

  toggleInviteForm(): void {
    this.showInviteForm.set(!this.showInviteForm());
  }

  sendInvite(): void {
    if (!this.inviteEmail) {
      return;
    }
    this.service.invite({ email: this.inviteEmail, role: this.inviteRole, herdScope: null }).subscribe(() => {
      this.inviteEmail = '';
      this.showInviteForm.set(false);
      this.reload();
    });
  }

  startEdit(user: UserSummary): void {
    this.editingUserId.set(user.id);
    this.editRole = user.role;
  }

  cancelEdit(): void {
    this.editingUserId.set(null);
  }

  saveRole(user: UserSummary): void {
    this.service.changeRole(user.id, { role: this.editRole, herdScope: user.herdAccess }).subscribe(() => {
      this.editingUserId.set(null);
      this.reload();
    });
  }

  async deactivate(user: UserSummary): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Deactivate User',
      message: `Deactivate ${user.email}? They will lose access immediately.`,
      confirmLabel: 'Deactivate',
      cancelLabel: 'Cancel',
      tone: 'danger',
    });
    if (confirmed) {
      this.service.deactivate(user.id).subscribe(() => this.reload());
    }
  }

  reactivate(user: UserSummary): void {
    this.service.reactivate(user.id).subscribe(() => this.reload());
  }
}
