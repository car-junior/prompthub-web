import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { PromptService } from '../services/prompt.service';
import { TagService } from '../../tags/services/tag.service';
import { TeamService } from '../../teams/services/team.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Tag } from '../../tags/models/tag.model';
import { Team } from '../../teams/models/team.model';

@Component({
  selector: 'app-prompt-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatRadioModule,
  ],
  templateUrl: './prompt-form.component.html',
  styleUrls: ['./prompt-form.component.scss'],
})
export class PromptFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly promptService = inject(PromptService);
  private readonly tagService = inject(TagService);
  private readonly teamService = inject(TeamService);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = signal(false);
  loadingData = signal(false);
  tags = signal<Tag[]>([]);
  teams = signal<Team[]>([]);
  promptId: number | null = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    ownerType: ['personal' as 'personal' | 'team'],
    teamId: [null as number | null],
    tagIds: [[] as number[]],
  });

  get isEdit(): boolean { return this.promptId !== null; }
  get name() { return this.form.get('name')!; }
  get description() { return this.form.get('description')!; }
  get ownerType() { return this.form.get('ownerType')!; }
  get teamId() { return this.form.get('teamId')!; }

  ngOnInit(): void {
    this.loadSupportData();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.promptId = +id;
      this.loadPrompt();
    }
  }

  private loadSupportData(): void {
    this.tagService.getAll({ itemsPerPage: 100 }).subscribe({ next: r => this.tags.set(r.result) });
    this.teamService.getAll({ itemsPerPage: 100 }).subscribe({ next: r => this.teams.set(r.result) });
  }

  private loadPrompt(): void {
    this.loadingData.set(true);
    this.promptService.getById(this.promptId!).subscribe({
      next: (p) => {
        this.form.patchValue({
          name: p.name,
          description: p.description ?? '',
          ownerType: p.teamId ? 'team' : 'personal',
          teamId: p.teamId ?? null,
          tagIds: p.tags.map(t => t.id),
        });
        this.loadingData.set(false);
      },
      error: () => this.loadingData.set(false),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    const { name, description, ownerType, teamId, tagIds } = this.form.value;

    const payload = {
      name: name!,
      description: description || undefined,
      teamId: ownerType === 'team' ? teamId ?? undefined : undefined,
      ownerId: ownerType === 'personal' ? undefined : undefined,
      tagIds: tagIds ?? [],
    };

    const request$ = this.isEdit
      ? this.promptService.update(this.promptId!, payload)
      : this.promptService.create(payload);

    request$.subscribe({
      next: (p) => {
        this.notification.success(this.isEdit ? 'Prompt atualizado!' : 'Prompt criado!');
        this.router.navigate(['/dashboard/prompts', p.id]);
      },
      error: () => this.loading.set(false),
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/prompts']);
  }
}
