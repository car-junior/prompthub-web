import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { User, GlobalRole } from '../../core/models/user.model';
import { UserRoleDialogComponent } from '../user-role-dialog/user-role-dialog.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
  ],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  user = signal<User | null>(null);
  loading = signal(false);
  userId!: number;

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.userService.getById(this.userId).subscribe({
      next: (u) => { this.user.set(u); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  toggleStatus(): void {
    const u = this.user();
    if (!u) return;
    const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.userService.changeStatus(u.id, newStatus).subscribe({
      next: () => {
        this.notification.success(`Usuário ${newStatus === 'INACTIVE' ? 'desativado' : 'ativado'} com sucesso.`);
        this.load();
      },
    });
  }

  openChangeRole(): void {
    const u = this.user();
    if (!u) return;
    const ref = this.dialog.open(UserRoleDialogComponent, {
      data: { currentRole: u.role },
      width: '380px',
    });
    ref.afterClosed().subscribe((role: GlobalRole | undefined) => {
      if (!role) return;
      this.userService.changeRole(u.id, role).subscribe({
        next: () => { this.notification.success('Função atualizada com sucesso.'); this.load(); },
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/users']);
  }
}
