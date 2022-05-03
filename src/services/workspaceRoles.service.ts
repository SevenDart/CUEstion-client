import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';
import {WorkspaceUser} from '../Models/WorkspaceUser';
import {Workspace} from '../Models/Workspace';
import {WorkspaceRole} from '../Models/WorkspaceRole';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceRolesService {
  constructor(private http: HttpClient) {
  }

  GetWorkspaceRoles(workspaceId: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.get<WorkspaceRole[]>(`${environment.serverAddress}/workspaces/${workspaceId}/roles`, options);
  }

  GetWorkspaceRoleById(workspaceId: number, workspaceRoleId: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.get<WorkspaceRole>(`${environment.serverAddress}/workspaces/${workspaceId}/roles/${workspaceRoleId}`, options);
  }

  AddWorkspaceRole(workspaceId: number,
                   role: string,
                   canCreate: boolean,
                   canUpdate: boolean,
                   canDelete: boolean,
                   canAddUsers: boolean,
                   canManageRoles: boolean) {
    const workspaceRole = {
      Role: role,
      WorkspaceId: workspaceId,
      CanCreate: canCreate,
      CanUpdate: canUpdate,
      CanDelete: canDelete,
      CanAddUsers: canAddUsers,
      CanManageRoles: canManageRoles
    };

    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.post<WorkspaceRole>(`${environment.serverAddress}/workspaces/${workspaceId}/roles`, workspaceRole, options);
  }

  UpdateWorkspaceRole(workspaceId: number,
                   workspaceRoleId: number,
                   role: string,
                   canCreate: boolean,
                   canUpdate: boolean,
                   canDelete: boolean,
                   canAddUsers: boolean,
                   canManageRoles: boolean) {
    const workspaceRole = {
      Role: role,
      WorkspaceId: workspaceId,
      CanCreate: canCreate,
      CanUpdate: canUpdate,
      CanDelete: canDelete,
      CanAddUsers: canAddUsers,
      CanManageRoles: canManageRoles
    };

    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.put<WorkspaceRole>(`${environment.serverAddress}/workspaces/${workspaceId}/roles/${workspaceRoleId}`,
      workspaceRole, options);
  }

  DeleteWorkspaceRole(workspaceId: number, workspaceRoleId: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.delete(`${environment.serverAddress}/workspaces/${workspaceId}/roles/${workspaceRoleId}`, options);
  }
}
