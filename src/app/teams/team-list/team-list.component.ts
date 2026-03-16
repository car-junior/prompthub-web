import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TeamService } from '../services/team.service';
import { NotificationService } from '../../core/services/notification.service';
import { Team, TeamSearch } from '../models/team.model';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatPaginatorModule,
  ],
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss'],
})
export class TeamListComponent implements OnInit {
  private readonly teamService = inject(TeamService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  teams = signal<Team[]>([]);
  loading = signal(false);
  totalResults = signal(0);

  search: TeamSearch = { page: 0, itemsPerPage: 10, sortName: 'name', sort: 'ASC' };
  nameFilter = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.teamService.getAll(this.search).subscribe({
      next: (res) => {
        this.teams.set(res.result);
        this.totalResults.set(res.totalResults);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilter(): void {
    this.search = { ...this.search, page: 0, name: this.nameFilter || undefined };
    this.load();
  }

  clearFilter(): void {
    this.nameFilter = '';
    this.search = { ...this.search, page: 0, name: undefined };
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.search = { ...this.search, page: event.pageIndex, itemsPerPage: event.pageSize };
    this.load();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dashboard/teams', id]);
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/teams/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/dashboard/teams', id, 'edit']);
  }

  toggleStatus(team: Team): void {
    this.teamService.changeStatus(team.id).subscribe({
      next: () => {
        this.notification.success(`Time ${team.status === 'ACTIVE' ? 'desativado' : 'ativado'} com sucesso.`);
        this.load();
      },
    });
  }
}
