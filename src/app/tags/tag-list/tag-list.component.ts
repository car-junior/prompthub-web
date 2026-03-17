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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TagService } from '../services/tag.service';
import { NotificationService } from '../../core/services/notification.service';
import { Tag, TagSearch } from '../models/tag.model';
import { TagFormDialogComponent } from '../tag-form-dialog/tag-form-dialog.component';

@Component({
  selector: 'app-tag-list',
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
    MatDialogModule,
  ],
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],
})
export class TagListComponent implements OnInit {
  private readonly tagService = inject(TagService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  tags = signal<Tag[]>([]);
  loading = signal(false);
  totalResults = signal(0);

  search: TagSearch = { page: 0, itemsPerPage: 10, sortName: 'name', sort: 'ASC' };
  nameFilter = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.tagService.getAll(this.search).subscribe({
      next: (res) => {
        this.tags.set(res.result);
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

  openCreate(): void {
    const ref = this.dialog.open(TagFormDialogComponent, { data: null, width: '480px' });
    ref.afterClosed().subscribe((created: boolean) => { if (created) this.load(); });
  }

  openEdit(tag: Tag): void {
    const ref = this.dialog.open(TagFormDialogComponent, { data: tag, width: '480px' });
    ref.afterClosed().subscribe((updated: boolean) => { if (updated) this.load(); });
  }

  delete(tag: Tag): void {
    if (!confirm(`Excluir a tag "${tag.name}"?`)) return;
    this.tagService.delete(tag.id).subscribe({
      next: () => { this.notification.success('Tag excluída.'); this.load(); },
    });
  }
}
