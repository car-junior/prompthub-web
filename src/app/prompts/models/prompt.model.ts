import { PageParams } from '../../core/models/page.model';
import { Tag } from '../../tags/models/tag.model';

export type PromptVersionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type PromptVersionVisibility = 'PUBLIC' | 'PRIVATE' | 'TEAM';

export interface Prompt {
  id: number;
  name: string;
  description?: string;
  teamId?: number;
  teamName?: string;
  ownerId?: number;
  ownerUsername?: string;
  tags: Tag[];
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface PromptVersion {
  id: number;
  promptId: number;
  version: string;
  content: string;
  status: PromptVersionStatus;
  visibility: PromptVersionVisibility;
  authorId: number;
  authorUsername?: string;
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface PromptCreateRequest {
  name: string;
  description?: string;
  teamId?: number;
  ownerId?: number;
  tagIds?: number[];
}

export interface PromptVersionCreateRequest {
  promptId: number;
  version: string;
  content: string;
  visibility: PromptVersionVisibility;
}

export interface PromptVersionUpdateRequest {
  version: string;
  content: string;
  visibility: PromptVersionVisibility;
}

export interface PromptSearch extends PageParams {
  query?: string;
  teamId?: number;
  ownerId?: number;
  tagId?: number;
}

export interface PromptVersionSearch extends PageParams {
  promptId?: number;
  status?: PromptVersionStatus;
  visibility?: PromptVersionVisibility;
}
