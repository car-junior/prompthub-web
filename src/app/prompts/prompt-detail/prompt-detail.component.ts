import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PromptService } from '../services/prompt.service';
import { NotificationService } from '../../core/services/notification.service';
import { Prompt, PromptVersion, PromptVersionStatus, PromptVersionVisibility } from '../models/prompt.model';
import { PromptVersionFormDialogComponent } from '../prompt-version-form-dialog/prompt-version-form-dialog.component';

@Component({
  selector: 'app-prompt-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
  ],
  templateUrl: './prompt-detail.component.html',
  styleUrls: ['./prompt-detail.component.scss'],
})
export class PromptDetailComponent implements OnInit {
  private readonly promptService = inject(PromptService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  prompt = signal<Prompt | null>(null);
  versions = signal<PromptVersion[]>([]);
  loading = signal(false);
  loadingVersions = signal(false);
  promptId!: number;

  readonly statusLabels: Record<PromptVersionStatus, string> = {
    DRAFT: 'Rascunho',
    PUBLISHED: 'Publicado',
    ARCHIVED: 'Arquivado',
  };

  readonly visibilityLabels: Record<PromptVersionVisibility, string> = {
    PUBLIC: 'Público',
    PRIVATE: 'Privado',
    TEAM: 'Time',
  };

  readonly statusBadge: Record<PromptVersionStatus, string> = {
    DRAFT: 'badge-warning',
    PUBLISHED: 'badge-success',
    ARCHIVED: 'badge-neutral',
  };

  readonly visibilityBadge: Record<PromptVersionVisibility, string> = {
    PUBLIC: 'badge-info',
    PRIVATE: 'badge-neutral',
    TEAM: 'badge-warning',
  };

  ngOnInit(): void {
    this.promptId = +this.route.snapshot.paramMap.get('id')!;
    this.loadPrompt();
    this.loadVersions();
  }

  loadPrompt(): void {
    this.loading.set(true);
    this.promptService.getById(this.promptId).subscribe({
      next: (p) => { this.prompt.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadVersions(): void {
    this.loadingVersions.set(true);
    this.promptService.getVersions({ promptId: this.promptId, itemsPerPage: 50, sortName: 'version', sort: 'DESC' }).subscribe({
      next: (r) => { this.versions.set(r.result); this.loadingVersions.set(false); },
      error: () => this.loadingVersions.set(false),
    });
  }

  openAddVersion(): void {
    const ref = this.dialog.open(PromptVersionFormDialogComponent, {
      data: { promptId: this.promptId, version: null },
      width: '640px',
    });
    ref.afterClosed().subscribe((saved: boolean) => { if (saved) this.loadVersions(); });
  }

  openEditVersion(version: PromptVersion): void {
    const ref = this.dialog.open(PromptVersionFormDialogComponent, {
      data: { promptId: this.promptId, version },
      width: '640px',
    });
    ref.afterClosed().subscribe((saved: boolean) => { if (saved) this.loadVersions(); });
  }

  changeVersionStatus(version: PromptVersion, status: PromptVersionStatus): void {
    this.promptService.changeVersionStatus(version.id, status).subscribe({
      next: () => { this.notification.success('Status atualizado.'); this.loadVersions(); },
    });
  }

  changeVersionVisibility(version: PromptVersion, visibility: PromptVersionVisibility): void {
    this.promptService.changeVersionVisibility(version.id, visibility).subscribe({
      next: () => { this.notification.success('Visibilidade atualizada.'); this.loadVersions(); },
    });
  }

  goToEdit(): void {
    this.router.navigate(['/dashboard/prompts', this.promptId, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/prompts']);
  }
}
