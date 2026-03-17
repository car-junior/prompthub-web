import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResult } from '../../core/models/page.model';
import { Tag, TagCreateRequest, TagSearch } from '../models/tag.model';

@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tags`;

  getAll(search: TagSearch = {}): Observable<PageResult<Tag>> {
    let params = new HttpParams();
    if (search.page != null) params = params.set('page', search.page);
    if (search.itemsPerPage != null) params = params.set('itemsPerPage', search.itemsPerPage);
    if (search.sort) params = params.set('sort', search.sort);
    if (search.sortName) params = params.set('sortName', search.sortName);
    if (search.name) params = params.set('name', search.name);
    if (search.slug) params = params.set('slug', search.slug);
    return this.http.get<PageResult<Tag>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/${id}`);
  }

  create(data: TagCreateRequest): Observable<Tag> {
    return this.http.post<Tag>(this.apiUrl, data);
  }

  update(id: number, data: TagCreateRequest): Observable<Tag> {
    return this.http.put<Tag>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
