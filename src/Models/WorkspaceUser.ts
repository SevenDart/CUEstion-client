import {User} from './User';
import {WorkspaceRole} from './WorkspaceRole';
import {Workspace} from './Workspace';

export class WorkspaceUser {
  userId: number;
  user: User;
  workspaceId: number;
  workspace: Workspace;
  workspaceRoleId: number;
  workspaceRole: WorkspaceRole;
}
