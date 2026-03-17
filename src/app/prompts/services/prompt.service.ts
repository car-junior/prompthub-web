import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResult } from '../../core/models/page.model';
import {
  Prompt,
  PromptVersion,
  PromptCreateRequest,
  PromptVersionCreateRequest,
  PromptVersionUpdateRequest,
  PromptSearch,
  PromptVersionSearch,
  PromptVersionStatus,
  PromptVersionVisibility,
} from '../models/prompt.model';

@Injectable({ providedIn: 'root' })
export class PromptService {
  private readonly http = inject(HttpClient);
  private readonly promptsUrl = `${environment.apiUrl}/prompts`;
  private readonly versionsUrl = `${environment.apiUrl}/prompt-versions`;

  // ── Prompts ──────────────────────────────────────────────

  getAll(search: PromptSearch = {}): Observable<PageResult<Prompt>> {
    let params = new HttpParams();
    if (search.page != null) params = params.set('page', search.page);
    if (search.itemsPerPage != null) params = params.set('itemsPerPage', search.itemsPerPage);
    if (search.sort) params = params.set('sort', search.sort);
    if (search.sortName) params = params.set('sortName', search.sortName);
    if (search.query) params = params.set('query', search.query);
    if (search.teamId != null) params = params.set('teamId', search.teamId);
    if (search.ownerId != null) params = params.set('ownerId', search.ownerId);
    if (search.tagId != null) params = params.set('tagId', search.tagId);
    return this.http.get<PageResult<Prompt>>(this.promptsUrl, { params });
  }

  getById(id: number): Observable<Prompt> {
    return this.http.get<Prompt>(`${this.promptsUrl}/${id}`);
  }

  create(data: PromptCreateRequest): Observable<Prompt> {
    return this.http.post<Prompt>(this.promptsUrl, data);
  }

  update(id: number, data: PromptCreateRequest): Observable<Prompt> {
    return this.http.put<Prompt>(`${this.promptsUrl}/${id}`, data);
  }

  // ── Prompt Versions ──────────────────────────────────────

  getVersions(search: PromptVersionSearch = {}): Observable<PageResult<PromptVersion>> {
    let params = new HttpParams();
    if (search.page != null) params = params.set('page', search.page);
    if (search.itemsPerPage != null) params = params.set('itemsPerPage', search.itemsPerPage);
    if (search.sort) params = params.set('sort', search.sort);
    if (search.sortName) params = params.set('sortName', search.sortName);
    if (search.promptId != null) params = params.set('promptId', search.promptId);
    if (search.status) params = params.set('status', search.status);
    if (search.visibility) params = params.set('visibility', search.visibility);
    return this.http.get<PageResult<PromptVersion>>(this.versionsUrl, { params });
  }

  getVersionById(id: number): Observable<PromptVersion> {
    return this.http.get<PromptVersion>(`${this.versionsUrl}/${id}`);
  }

  createVersion(data: PromptVersionCreateRequest): Observable<PromptVersion> {
    return this.http.post<PromptVersion>(this.versionsUrl, data);
  }

  updateVersion(id: number, data: PromptVersionUpdateRequest): Observable<PromptVersion> {
    return this.http.put<PromptVersion>(`${this.versionsUrl}/${id}`, data);
  }

  changeVersionStatus(id: number, status: PromptVersionStatus): Observable<void> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<void>(`${this.versionsUrl}/${id}/change-status`, {}, { params });
  }

  changeVersionVisibility(id: number, visibility: PromptVersionVisibility): Observable<void> {
    const params = new HttpParams().set('visibility', visibility);
    return this.http.patch<void>(`${this.versionsUrl}/${id}/change-visibility`, {}, { params });
  }
}
