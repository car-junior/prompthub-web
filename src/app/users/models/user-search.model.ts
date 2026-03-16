import { PageParams } from '../../core/models/page.model';
import { EntityStatus, GlobalRole } from '../../core/models/user.model';

export interface UserSearch extends PageParams {
  username?: string;
  role?: GlobalRole;
  status?: EntityStatus;
}
