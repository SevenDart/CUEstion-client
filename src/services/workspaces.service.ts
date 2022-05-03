import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';
import {WorkspaceUser} from '../Models/WorkspaceUser';
import {Workspace} from '../Models/Workspace';
import {WorkspaceRole} from '../Models/WorkspaceRole';

@Injectable({
  providedIn: 'root'
})
export class WorkspacesService {
  constructor(private http: HttpClient) {
  }

  SetCurrentWorkspace(workspaceUser: WorkspaceUser) {
    localStorage.setItem('workspaceId', workspaceUser.workspace.id.toString());
  }

  GetUserWorkspaces() {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.get<WorkspaceUser[]>(`${environment.serverAddress}/users/workspaces`, options);
  }

  GetWorkspaceUser(workspaceId: number, userId: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.get<WorkspaceUser>(`${environment.serverAddress}/workspaces/${workspaceId}/users/${userId}`, options);
  }

  GetWorkspaceById(workspaceId: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.get<Workspace>(`${environment.serverAddress}/workspaces/${workspaceId}`, options);
  }

  GetWorkspaceUsers(workspaceId: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.get<WorkspaceUser[]>(`${environment.serverAddress}/workspaces/${workspaceId}/users`, options);
  }

  AddWorkspace(workspaceName: string, description: string) {
    const workspace = {
      Name: workspaceName,
      Description: description,
      ChiefId: Number(localStorage.getItem('userId'))
    };

    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.post(`${environment.serverAddress}/workspaces`, workspace, options);
  }

  UpdateWorkspace(workspaceId: number, workspaceName: string, description: string, chiefId: number) {
    const workspace = {
      Name: workspaceName,
      Description: description,
      ChiefId: chiefId
    };

    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.put(`${environment.serverAddress}/workspaces/${workspaceId}`, workspace, options);
  }

  DeleteWorkspace(workspaceId: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.delete(`${environment.serverAddress}/workspaces/${workspaceId}`, options);
  }

  AddUserToWorkspace(workspaceId: number, userId: number, workspaceRoleId: number) {
    const workspaceUser = {
      WorkspaceId: workspaceId,
      UserId: userId,
      WorkspaceRoleId: workspaceRoleId
    };

    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.post(`${environment.serverAddress}/workspaces/${workspaceId}/add-user`, workspaceUser, options);
  }

  UpdateWorkspaceUser(workspaceId: number, userId: number, newWorkspaceRoleId: number) {
    const workspaceUser = {
      WorkspaceId: workspaceId,
      UserId: userId,
      WorkspaceRoleId: newWorkspaceRoleId
    };

    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.put(`${environment.serverAddress}/workspaces/${workspaceId}/update-user/${userId}`, workspaceUser, options);
  }

  RemoveUserFromWorkspace(workspaceId: number, userId: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.delete(`${environment.serverAddress}/workspaces/${workspaceId}/remove-user/${userId}`, options);
  }
}
