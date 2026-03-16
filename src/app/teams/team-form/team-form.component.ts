import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamService } from '../services/team.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.scss'],
})
export class TeamFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly teamService = inject(TeamService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = signal(false);
  loadingData = signal(false);
  teamId: number | null = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
  });

  get isEdit(): boolean { return this.teamId !== null; }
  get name() { return this.form.get('name')!; }
  get description() { return this.form.get('description')!; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.teamId = +id;
      this.loadTeam();
    }
  }

  private loadTeam(): void {
    this.loadingData.set(true);
    this.teamService.getById(this.teamId!).subscribe({
      next: (team) => {
        this.form.patchValue({ name: team.name, description: team.description ?? '' });
        this.loadingData.set(false);
      },
      error: () => this.loadingData.set(false),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { name, description } = this.form.value;
    const payload = { name: name!, description: description || undefined };

    const request$ = this.isEdit
      ? this.teamService.update(this.teamId!, payload)
      : this.teamService.create(payload);

    request$.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Time atualizado com sucesso!' : 'Time criado com sucesso!');
        this.router.navigate(['/dashboard/teams']);
      },
      error: () => this.loading.set(false),
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/teams']);
  }
}
