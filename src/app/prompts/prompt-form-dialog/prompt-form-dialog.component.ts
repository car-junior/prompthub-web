import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PromptService } from '../services/prompt.service';
import { TagService } from '../../tags/services/tag.service';
import { TeamService } from '../../teams/services/team.service';
import { NotificationService } from '../../core/services/notification.service';
import { Tag } from '../../tags/models/tag.model';
import { Team } from '../../teams/models/team.model';
import { Prompt } from '../models/prompt.model';

@Component({
  selector: 'app-prompt-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './prompt-form-dialog.component.html',
  styleUrls: ['./prompt-form-dialog.component.scss'],
})
export class PromptFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly promptService = inject(PromptService);
  private readonly tagService = inject(TagService);
  private readonly teamService = inject(TeamService);
  private readonly notification = inject(NotificationService);
  readonly dialogRef = inject(MatDialogRef<PromptFormDialogComponent>);

  loading = signal(false);
  tags = signal<Tag[]>([]);
  teams = signal<Team[]>([]);
  isEdit: boolean;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    ownerType: ['personal' as 'personal' | 'team'],
    teamId: [null as number | null],
    tagIds: [[] as number[]],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: Prompt | null) {
    this.isEdit = !!data;
    if (data) {
      this.form.patchValue({
        name: data.name,
        description: data.description ?? '',
        ownerType: data.teamId ? 'team' : 'personal',
        teamId: data.teamId ?? null,
        tagIds: data.tags?.map(t => t.id) ?? [],
      });
    }
  }

  get name() { return this.form.get('name')!; }
  get ownerType() { return this.form.get('ownerType')!; }

  ngOnInit(): void {
    this.tagService.getAll({ itemsPerPage: 100 }).subscribe({ next: r => this.tags.set(r.result) });
    this.teamService.getAll({ itemsPerPage: 100 }).subscribe({ next: r => this.teams.set(r.result) });
  }

  onConfirm(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    const { name, description, ownerType, teamId, tagIds } = this.form.value;
    const payload = {
      name: name!,
      description: description || undefined,
      teamId: ownerType === 'team' ? teamId ?? undefined : undefined,
      tagIds: tagIds ?? [],
    };

    const request$ = this.isEdit
      ? this.promptService.update(this.data!.id, payload)
      : this.promptService.create(payload);

    request$.subscribe({
      next: (p) => {
        this.notification.success(this.isEdit ? 'Prompt atualizado!' : 'Prompt criado!');
        this.dialogRef.close(p);
      },
      error: () => this.loading.set(false),
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
