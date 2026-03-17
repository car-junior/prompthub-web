import { PageParams } from '../../core/models/page.model';

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface TagCreateRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface TagSearch extends PageParams {
  query?: string;
  slug?: string;
}
