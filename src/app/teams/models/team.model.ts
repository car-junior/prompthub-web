import { PageParams, PageResult } from '../../core/models/page.model';

export type TeamStatus = 'ACTIVE' | 'INACTIVE';
export type TeamRole = 'TEAM_OWNER' | 'DEV' | 'VIEWER';

export interface Team {
  id: number;
  name: string;
  description?: string;
  status: TeamStatus;
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface TeamMemberUser {
  id: number;
  username: string;
  email: string;
}

export interface TeamMember {
  id: number;
  user: TeamMemberUser;
  role: TeamRole;
}

export interface TeamCreateRequest {
  name: string;
  description?: string;
}

export interface TeamWithMembersRequest {
  name: string;
  description?: string;
  members: { userId: number; role: TeamRole }[];
}

export interface TeamSearch extends PageParams {
  name?: string;
  status?: TeamStatus;
}

export interface AddMemberRequest {
  userId: number;
  role: TeamRole;
}

export interface ChangeMemberRoleRequest {
  role: TeamRole;
}
