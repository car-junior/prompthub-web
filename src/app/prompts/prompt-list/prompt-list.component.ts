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
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PromptService } from '../services/prompt.service';
import { Prompt, PromptSearch } from '../models/prompt.model';
import { PromptFormDialogComponent } from '../prompt-form-dialog/prompt-form-dialog.component';

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
    MatChipsModule,
    PaginatorComponent,
  ],
  templateUrl: './prompt-list.component.html',
  styleUrls: ['./prompt-list.component.scss'],
})
export class PromptListComponent implements OnInit {
  private readonly promptService = inject(PromptService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  prompts = signal<Prompt[]>([]);
  loading = signal(false);
  totalResults = signal(0);

  search: PromptSearch = { page: 0, itemsPerPage: 12, sortName: 'name', sort: 'ASC' };
  queryFilter = '';

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
    this.router.navigate(['/dashboard/prompts', id]);
  }

  openCreate(): void {
    this.dialog.open(PromptFormDialogComponent, { data: null, width: '520px' })
      .afterClosed().subscribe(prompt => {
        if (prompt) this.router.navigate(['/dashboard/prompts', prompt.id]);
      });
  }

  openEdit(prompt: Prompt): void {
    this.dialog.open(PromptFormDialogComponent, { data: prompt, width: '520px' })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }
}
