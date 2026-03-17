import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { PaginatorComponent } from '../../shared/paginator/paginator.component';
import { UserService } from '../services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';
import { UserSearch } from '../models/user-search.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    PaginatorComponent,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  users = signal<User[]>([]);
  loading = signal(false);
  totalResults = signal(0);

  search: UserSearch = { page: 0, itemsPerPage: 10, sortName: 'username', sort: 'ASC' };
  queryFilter = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.userService.getAll(this.search).subscribe({
      next: (res) => {
        this.users.set(res.result);
        this.totalResults.set(res.totalResults);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilter(): void {
    this.search = { ...this.search, page: 0, query: this.queryFilter || undefined };
    this.load();
  }

  clearFilter(): void {
    this.queryFilter = '';
    this.search = { ...this.search, page: 0, query: undefined };
    this.load();
  }

  onPageChange(page: number): void {
    this.search = { ...this.search, page };
    this.load();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/users', id]);
  }

  toggleStatus(user: User): void {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.userService.changeStatus(user.id, newStatus).subscribe({
      next: () => {
        this.notification.success(`Usuário ${newStatus === 'INACTIVE' ? 'desativado' : 'ativado'} com sucesso.`);
        this.load();
      },
    });
  }
}
