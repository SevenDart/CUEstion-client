export class WorkspaceRole {
  id: number;
  role: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManageRoles: boolean;
  canAddUsers: boolean;
}
