import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TeamService } from '../services/team.service';
import { NotificationService } from '../../core/services/notification.service';
import { Team, TeamMember } from '../models/team.model';
import { TeamMemberDialogComponent, MemberDialogResult } from '../team-member-dialog/team-member-dialog.component';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
  ],
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss'],
})
export class TeamDetailComponent implements OnInit {
  private readonly teamService = inject(TeamService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  team = signal<Team | null>(null);
  members = signal<TeamMember[]>([]);
  loading = signal(false);
  loadingMembers = signal(false);

  teamId!: number;

  readonly roleLabels: Record<string, string> = {
    TEAM_OWNER: 'Owner',
    DEV: 'Dev',
    VIEWER: 'Viewer',
  };

  ngOnInit(): void {
    this.teamId = +this.route.snapshot.paramMap.get('id')!;
    this.loadTeam();
    this.loadMembers();
  }

  loadTeam(): void {
    this.loading.set(true);
    this.teamService.getById(this.teamId).subscribe({
      next: (t) => { this.team.set(t); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadMembers(): void {
    this.loadingMembers.set(true);
    this.teamService.getMembers(this.teamId).subscribe({
      next: (m) => { this.members.set(m); this.loadingMembers.set(false); },
      error: () => this.loadingMembers.set(false),
    });
  }

  openAddMember(): void {
    const ref = this.dialog.open(TeamMemberDialogComponent, {
      data: {},
      width: '400px',
    });
    ref.afterClosed().subscribe((result: MemberDialogResult | undefined) => {
      if (!result) return;
      this.teamService.addMember(this.teamId, { userId: result.userId!, role: result.role }).subscribe({
        next: () => { this.notification.success('Membro adicionado!'); this.loadMembers(); },
      });
    });
  }

  openEditRole(member: TeamMember): void {
    const ref = this.dialog.open(TeamMemberDialogComponent, {
      data: { member },
      width: '400px',
    });
    ref.afterClosed().subscribe((result: MemberDialogResult | undefined) => {
      if (!result) return;
      this.teamService.changeMemberRole(this.teamId, member.userId, { role: result.role }).subscribe({
        next: () => { this.notification.success('Função atualizada!'); this.loadMembers(); },
      });
    });
  }

  removeMember(member: TeamMember): void {
    this.teamService.removeMember(this.teamId, member.userId).subscribe({
      next: () => { this.notification.success('Membro removido.'); this.loadMembers(); },
    });
  }

  goToEdit(): void {
    this.router.navigate(['/dashboard/teams', this.teamId, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/teams']);
  }
}
