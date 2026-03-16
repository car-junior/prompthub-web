export type GlobalRole = 'ADMIN' | 'USER';
export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface User {
  id: number;
  username: string;
  email: string;
  role: GlobalRole;
  status: EntityStatus;
  mustChangePassword: boolean;
  createdDate?: string;
  lastModifiedDate?: string;
}
