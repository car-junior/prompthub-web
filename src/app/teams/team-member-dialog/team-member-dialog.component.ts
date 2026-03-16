import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamRole, TeamMember } from '../models/team.model';

export interface MemberDialogData {
  member?: TeamMember; // se passado, é edição de role
}

export interface MemberDialogResult {
  userId?: number;
  role: TeamRole;
}

@Component({
  selector: 'app-team-member-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './team-member-dialog.component.html',
  styleUrls: ['./team-member-dialog.component.scss'],
})
export class TeamMemberDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<TeamMemberDialogComponent>);

  readonly roles: { value: TeamRole; label: string }[] = [
    { value: 'TEAM_OWNER', label: 'Owner' },
    { value: 'DEV', label: 'Dev' },
    { value: 'VIEWER', label: 'Viewer' },
  ];

  isEdit: boolean;

  form = this.fb.group({
    userId: [null as number | null],
    role: ['VIEWER' as TeamRole, Validators.required],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: MemberDialogData) {
    this.isEdit = !!data?.member;
    if (this.isEdit) {
      this.form.patchValue({ role: data.member!.role });
    } else {
      this.form.get('userId')!.setValidators([Validators.required]);
      this.form.get('userId')!.updateValueAndValidity();
    }
  }

  get userId() { return this.form.get('userId')!; }
  get role() { return this.form.get('role')!; }

  onConfirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const result: MemberDialogResult = {
      role: this.form.value.role as TeamRole,
      userId: this.isEdit ? undefined : this.form.value.userId!,
    };
    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
