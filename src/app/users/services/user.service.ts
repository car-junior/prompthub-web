import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResult } from '../../core/models/page.model';
import { User, GlobalRole } from '../../core/models/user.model';
import { UserSearch } from '../models/user-search.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getAll(search: UserSearch = {}): Observable<PageResult<User>> {
    let params = new HttpParams();
    if (search.page != null) params = params.set('page', search.page);
    if (search.itemsPerPage != null) params = params.set('itemsPerPage', search.itemsPerPage);
    if (search.sort) params = params.set('sort', search.sort);
    if (search.sortName) params = params.set('sortName', search.sortName);
    if (search.query) params = params.set('query', search.query);
    if (search.role) params = params.set('role', search.role);
    if (search.status) params = params.set('status', search.status);
    return this.http.get<PageResult<User>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  update(id: number, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  changeStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Observable<void> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<void>(`${this.apiUrl}/${id}/change-status`, {}, { params });
  }

  changeRole(id: number, role: GlobalRole): Observable<void> {
    const params = new HttpParams().set('role', role);
    return this.http.patch<void>(`${this.apiUrl}/${id}/change-role`, {}, { params });
  }
}
