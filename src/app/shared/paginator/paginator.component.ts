import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
})
export class PaginatorComponent implements OnChanges {
  @Input() totalResults = 0;
  @Input() pageSize = 10;
  @Input() page = 0; // 0-indexed
  @Output() pageChange = new EventEmitter<number>();

  pages: (number | '...')[] = [];

  get totalPages(): number {
    return Math.ceil(this.totalResults / this.pageSize);
  }

  ngOnChanges(): void {
    this.buildPages();
  }

  buildPages(): void {
    const total = this.totalPages;
    const current = this.page;
    const pages: (number | '...')[] = [];

    if (total <= 7) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      pages.push(0);
      if (current > 3) pages.push('...');
      const start = Math.max(1, current - 2);
      const end = Math.min(total - 2, current + 2);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 4) pages.push('...');
      pages.push(total - 1);
    }

    this.pages = pages;
  }

  goTo(p: number | '...'): void {
    if (p === '...') return;
    if (p === this.page) return;
    this.pageChange.emit(p as number);
  }

  prev(): void {
    if (this.page > 0) this.pageChange.emit(this.page - 1);
  }

  next(): void {
    if (this.page < this.totalPages - 1) this.pageChange.emit(this.page + 1);
  }
}
