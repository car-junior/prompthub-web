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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { PromptService } from '../services/prompt.service';
import { Prompt, PromptSearch } from '../models/prompt.model';

@Component({
  selector: 'app-prompt-list',
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
    MatPaginatorModule,
    MatChipsModule,
  ],
  templateUrl: './prompt-list.component.html',
  styleUrls: ['./prompt-list.component.scss'],
})
export class PromptListComponent implements OnInit {
  private readonly promptService = inject(PromptService);
  private readonly router = inject(Router);

  prompts = signal<Prompt[]>([]);
  loading = signal(false);
  totalResults = signal(0);

  search: PromptSearch = { page: 0, itemsPerPage: 12, sortName: 'name', sort: 'ASC' };
  nameFilter = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.promptService.getAll(this.search).subscribe({
      next: (res) => {
        this.prompts.set(res.result);
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
    this.router.navigate(['/dashboard/prompts', id]);
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/prompts/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/dashboard/prompts', id, 'edit']);
  }
}
