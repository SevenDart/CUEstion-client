import {User} from './User';
import {WorkspaceUser} from './WorkspaceUser';

export class Workspace {
  id: number;
  name: string;
  description: string;
  chiefId: number;
  chief?: User;
}
