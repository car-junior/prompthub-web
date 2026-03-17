import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResult } from '../../core/models/page.model';
import {
  Team,
  TeamMember,
  TeamCreateRequest,
  TeamWithMembersRequest,
  TeamSearch,
  AddMemberRequest,
  ChangeMemberRoleRequest,
} from '../models/team.model';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/teams`;

  getAll(search: TeamSearch = {}): Observable<PageResult<Team>> {
    let params = new HttpParams();
    if (search.page != null) params = params.set('page', search.page);
    if (search.itemsPerPage != null) params = params.set('itemsPerPage', search.itemsPerPage);
    if (search.sort) params = params.set('sort', search.sort);
    if (search.sortName) params = params.set('sortName', search.sortName);
    if (search.name) params = params.set('name', search.name);
    if (search.status) params = params.set('status', search.status);
    return this.http.get<PageResult<Team>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${id}`);
  }

  create(data: TeamCreateRequest): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, data);
  }

  createWithMembers(data: TeamWithMembersRequest): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/with-members`, data);
  }

  update(id: number, data: TeamCreateRequest): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/${id}`, data);
  }

  changeStatus(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/change-status`, {});
  }

  // Members
  getMembers(teamId: number): Observable<PageResult<TeamMember>> {
    return this.http.get<PageResult<TeamMember>>(`${this.apiUrl}/${teamId}/members`);
  }

  addMember(teamId: number, data: AddMemberRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${teamId}/members`, data);
  }

  changeMemberRole(teamId: number, userId: number, data: ChangeMemberRoleRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${teamId}/members/${userId}`, data);
  }

  removeMember(teamId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teamId}/members/${userId}`);
  }
}
